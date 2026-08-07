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
      take: 25,
    });

    if (files.length === 0) {
      throw new BadRequestException('No source files found in project to document');
    }

    const provider = await this.aiProvidersService.getProviderInstance(userId, providerId);

    const codebaseContext = files
      .map((f) => `--- FILE: ${f.path} (${f.language}) ---\n${f.content.slice(0, 2500)}\n--- END FILE ---`)
      .join('\n\n');

    const response = await provider.complete(
      [
        {
          role: 'system',
          content: `You are a Technical Documentation Writer. Generate comprehensive, production-ready Markdown documentation (README.md style) for the codebase.
Include:
1. Executive Architecture Overview
2. Core Modules & Responsibilities
3. API Endpoints & Interfaces
4. Setup & Running Instructions
5. Key Data Models`,
        },
        {
          role: 'user',
          content: `Generate complete README documentation for project "${project.name}":\n\n${codebaseContext}`,
        },
      ],
      { temperature: 0.2 },
    );

    return {
      projectName: project.name,
      markdownDocs: response.content,
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
