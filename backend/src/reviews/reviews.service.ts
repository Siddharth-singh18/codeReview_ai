import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { AIProvidersService } from '../ai-providers/ai-providers.service';
import { TriggerReviewDto } from './dto/review.dto';
import { buildReviewSystemPrompt, buildReviewUserPrompt, ReviewResult } from './prompts/review.prompts';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private aiProvidersService: AIProvidersService,
  ) {}

  async triggerReview(userId: string, projectId: string, dto: TriggerReviewDto) {
    // 1. Verify project ownership
    await this.projectsService.findOne(userId, projectId);

    // 2. Fetch files based on review scope
    let files: { id: string; path: string; content: string; language: string }[] = [];

    if (dto.scope === 'FILE' || dto.scope === 'MULTI_FILE') {
      if (!dto.fileIds || dto.fileIds.length === 0) {
        throw new BadRequestException('Please select target file(s) for file-scoped review');
      }
      files = await this.prisma.file.findMany({
        where: { projectId, id: { in: dto.fileIds } },
        select: { id: true, path: true, content: true, language: true },
      });
    } else {
      // Whole project review
      files = await this.prisma.file.findMany({
        where: { projectId },
        select: { id: true, path: true, content: true, language: true },
        take: 30, // Limit to top 30 files to fit context window sensibly
      });
    }

    if (files.length === 0) {
      throw new BadRequestException('No source files found for review');
    }

    // 3. Obtain polymorphic AI provider instance
    const provider = await this.aiProvidersService.getProviderInstance(userId, dto.providerId);

    // 4. Build prompt and invoke completion
    const systemPrompt = buildReviewSystemPrompt(dto.templateType);
    const userPrompt = buildReviewUserPrompt(files, dto.scope);

    const response = await provider.complete(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.2, responseFormatJson: true },
    );

    // 5. Parse and validate structured output defensively
    const parsedResult = this.parseReviewOutput(response.content, files[0].path);

    // 6. Persist Review record in DB
    const review = await this.prisma.review.create({
      data: {
        projectId,
        scope: dto.scope,
        templateType: dto.templateType,
        summary: parsedResult.summary,
        issues: JSON.stringify(parsedResult.issues),
      },
    });

    return {
      ...review,
      issues: parsedResult.issues,
    };
  }

  async findByProject(userId: string, projectId: string) {
    await this.projectsService.findOne(userId, projectId);

    const reviews = await this.prisma.review.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => ({
      ...r,
      issues: typeof r.issues === 'string' ? JSON.parse(r.issues) : r.issues,
    }));
  }

  async findOne(userId: string, id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { project: { select: { userId: true } } },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.project.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    return {
      ...review,
      issues: typeof review.issues === 'string' ? JSON.parse(review.issues) : review.issues,
    };
  }

  private parseReviewOutput(rawContent: string, defaultFilePath: string): ReviewResult {
    try {
      // Clean potential markdown code blocks like ```json ... ```
      let cleaned = rawContent.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
      }

      const json = JSON.parse(cleaned);

      const summary = json.summary || 'Code review completed successfully.';
      const rawIssues = Array.isArray(json.issues) ? json.issues : [];

      const issues = rawIssues.map((iss: any) => ({
        title: String(iss.title || 'Code Issue'),
        description: String(iss.description || 'No description provided'),
        severity: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(String(iss.severity).toUpperCase())
          ? (String(iss.severity).toUpperCase() as any)
          : 'MEDIUM',
        filePath: String(iss.filePath || defaultFilePath),
        lineRef: iss.lineRef ? String(iss.lineRef) : undefined,
        recommendation: iss.recommendation ? String(iss.recommendation) : undefined,
      }));

      return { summary, issues };
    } catch {
      // Fallback object if JSON parsing fails unexpectedly
      return {
        summary: 'Review generated (Raw format parsing fallback active).',
        issues: [
          {
            title: 'General Feedback',
            description: rawContent,
            severity: 'MEDIUM',
            filePath: defaultFilePath,
          },
        ],
      };
    }
  }
}
