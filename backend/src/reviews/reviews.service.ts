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
    await this.projectsService.findOne(userId, projectId);

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
      files = await this.prisma.file.findMany({
        where: { projectId },
        select: { id: true, path: true, content: true, language: true },
        take: 8,
      });
    }

    if (files.length === 0) {
      throw new BadRequestException('No source files found for review');
    }

    const provider = await this.aiProvidersService.getProviderInstance(userId, dto.providerId);
    const systemPrompt = buildReviewSystemPrompt(dto.templateType);
    const userPrompt = buildReviewUserPrompt(files, dto.scope);

    try {
      const response = await provider.complete(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        { temperature: 0.2, responseFormatJson: true },
      );

      const parsedResult = this.parseReviewOutput(response.content, files[0].path);

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
    } catch (err: any) {
      console.error('Review generation failed:', err);
      throw new BadRequestException(err.message || 'AI Review generation failed');
    }
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

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.review.delete({
      where: { id },
    });

    return { message: 'Review history entry deleted successfully' };
  }

  private parseReviewOutput(rawContent: string, defaultFilePath: string): ReviewResult {
    try {
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
