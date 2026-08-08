import { ReviewScope, TemplateType } from '@prisma/client';

export interface ReviewIssue {
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  filePath: string;
  lineRef?: string;
  recommendation?: string;
}

export interface ReviewResult {
  summary: string;
  issues: ReviewIssue[];
}

export function buildReviewSystemPrompt(templateType: TemplateType): string {
  const templateGuides: Record<TemplateType, string> = {
    SECURITY: `You are a Senior Cybersecurity Auditor & Code Security Specialist. Focus on detecting vulnerability vectors (OWASP Top 10, SQL injection, XSS, insecure data exposure, broken auth, unsafe dependencies, memory leaks, hardcoded credentials).`,
    PERFORMANCE: `You are a Principal Systems Architect & Performance Tuning Specialist. Focus on efficiency bottlenecks (algorithmic complexity, N+1 DB queries, unindexed queries, blocking I/O, improper caching, resource leaks, heavy renders).`,
    QUALITY: `You are a Tech Lead & Code Quality Specialist. Focus on maintainability, readability, design patterns, DRY principles, type safety, error handling robustness, architectural clarity, and testability.`,
  };

  return `${templateGuides[templateType]}

CRITICAL REQUIREMENT: You MUST respond ONLY with a valid, raw json object (without markdown code blocks, quote escaping, or commentary).

The JSON object MUST follow this exact structure:
{
  "summary": "High level executive summary of findings across the code (2-4 sentences)",
  "issues": [
    {
      "title": "Short descriptive title of issue",
      "description": "Detailed explanation of the flaw and why it matters",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "filePath": "relative/path/to/file.ext",
      "lineRef": "optional line number range or function name",
      "recommendation": "Concrete fix code snippet or actionable step"
    }
  ]
}`;
}

export function buildReviewUserPrompt(
  files: { path: string; content: string; language: string }[],
  scope: ReviewScope
): string {
  const formattedFiles = files
    .map(
      (f) => `--- START FILE: ${f.path} (${f.language}) ---\n${f.content}\n--- END FILE: ${f.path} ---`
    )
    .join('\n\n');

  return `Perform an automated ${scope} code review for the following codebase files:

${formattedFiles}`;
}
