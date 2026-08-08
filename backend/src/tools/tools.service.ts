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
      take: 25,
    });

    if (files.length === 0) {
      throw new BadRequestException('No source files found in project to scan');
    }

    const provider = await this.aiProvidersService.getProviderInstance(userId, providerId);

    const codebaseContext = files
      .map((f) => `--- FILE: ${f.path} (${f.language}) ---\n${f.content.slice(0, 2500)}\n--- END FILE ---`)
      .join('\n\n');

    const response = await provider.complete(
      [
        {
          role: 'system',
          content: `You are a Principal Architect scoring technical debt and code complexity.
CRITICAL REQUIREMENT: Respond ONLY with valid raw JSON (no markdown formatting).

Follow this exact JSON structure:
{
  "debtScore": number (0 to 100, where 0=clean, 100=critical debt),
  "complexityRating": "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH",
  "summary": "Short evaluation paragraph",
  "items": [
    {
      "filePath": "relative/path/to/file",
      "category": "Duplication" | "Complexity" | "Outdated Pattern" | "Missing Tests" | "Tight Coupling",
      "impact": "HIGH" | "MEDIUM" | "LOW",
      "effortToFix": "EASY" | "MEDIUM" | "HARD",
      "description": "Explanation",
      "refactoringTip": "Actionable code refactor"
    }
  ]
}`,
        },
        {
          role: 'user',
          content: `Perform Tech Debt & Cyclomatic Complexity audit for project "${project.name}":\n\n${codebaseContext}`,
        },
      ],
      { temperature: 0.2, responseFormatJson: true },
    );

    try {
      let cleaned = response.content.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
      }
      return JSON.parse(cleaned);
    } catch {
      return {
        debtScore: 45,
        complexityRating: 'MODERATE',
        summary: response.content,
        items: [],
      };
    }
  }
}
