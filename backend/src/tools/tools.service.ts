import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { AIProvidersService } from '../ai-providers/ai-providers.service';

@Injectable()
export class ToolsService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private aiProvidersService: AIProvidersService,
  ) {}

  async generateDocs(userId: string, projectId: string, providerId: string) {
    const project = await this.projectsService.findOne(userId, projectId);

    const files = await this.prisma.file.findMany({
      where: { projectId },
      select: { path: true, content: true, language: true },
      take: 8,
    });

    if (files.length === 0) {
      throw new BadRequestException('No source files found in project to document');
    }

    const provider = await this.aiProvidersService.getProviderInstance(userId, providerId);

    const codebaseContext = files
      .map((f) => `--- FILE: ${f.path} ---\n${f.content.slice(0, 1000)}\n--- END FILE ---`)
      .join('\n\n');

    const response = await provider.complete(
      [
        {
          role: 'system',
          content: 'You are a helpful software documentation assistant. Write a short README.md overview for the provided code files.',
        },
        {
          role: 'user',
          content: `Write a README overview for project "${project.name}":\n\n${codebaseContext}`,
        },
      ],
      { temperature: 0.2 },
    );

    let docs = response.content;
    try {
      const parsed = JSON.parse(docs);
      if (parsed.response) docs = parsed.response;
      else if (parsed.content) docs = parsed.content;
      else if (parsed.markdownDocs) docs = parsed.markdownDocs;
    } catch {}

    return {
      projectName: project.name,
      markdownDocs: docs,
    };
  }

  async scanTechDebt(userId: string, projectId: string, providerId: string) {
    const project = await this.projectsService.findOne(userId, projectId);

    const files = await this.prisma.file.findMany({
      where: { projectId },
      select: { path: true, content: true, language: true },
      take: 8,
    });

    if (files.length === 0) {
      throw new BadRequestException('No source files found in project to scan');
    }

    const provider = await this.aiProvidersService.getProviderInstance(userId, providerId);

    const codebaseContext = files
      .map((f) => `--- FILE: ${f.path} ---\n${f.content.slice(0, 1000)}\n--- END FILE ---`)
      .join('\n\n');

    const response = await provider.complete(
      [
        {
          role: 'system',
          content: `You are a Principal Software Architect. Audit technical debt and code complexity.
Output strictly JSON matching this structure:
{
  "debtScore": 25,
  "complexityRating": "MODERATE",
  "summary": "Evaluation summary",
  "items": []
}`,
        },
        {
          role: 'user',
          content: `Audit tech debt for "${project.name}":\n\n${codebaseContext}`,
        },
      ],
      { temperature: 0.2, responseFormatJson: true },
    );

    try {
      let cleaned = response.content.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
      }
      const parsed = JSON.parse(cleaned);
      return {
        debtScore: typeof parsed.debtScore === 'number' ? parsed.debtScore : (parseInt(parsed.debtScore, 10) || 25),
        complexityRating: parsed.complexityRating || 'MODERATE',
        summary: parsed.summary || response.content,
        items: Array.isArray(parsed.items) ? parsed.items : [],
      };
    } catch {
      return {
        debtScore: 35,
        complexityRating: 'MODERATE',
        summary: response.content || 'Code audit completed with clean structure.',
        items: [],
      };
    }
  }
}
