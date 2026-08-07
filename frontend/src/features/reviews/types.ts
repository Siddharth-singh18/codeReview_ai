export type ReviewScope = 'FILE' | 'MULTI_FILE' | 'PROJECT';
export type TemplateType = 'SECURITY' | 'PERFORMANCE' | 'QUALITY';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ReviewIssue {
  title: string;
  description: string;
  severity: Severity;
  filePath: string;
  lineRef?: string;
  recommendation?: string;
}

export interface Review {
  id: string;
  projectId: string;
  scope: ReviewScope;
  templateType: TemplateType;
  summary: string;
  issues: ReviewIssue[];
  createdAt: string;
}
