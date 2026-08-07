import { IsIn, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export type ReviewScope = 'FILE' | 'MULTI_FILE' | 'PROJECT';
export type TemplateType = 'SECURITY' | 'PERFORMANCE' | 'QUALITY';

export class TriggerReviewDto {
  @IsString()
  @IsNotEmpty({ message: 'AI Provider configuration ID is required' })
  providerId: string;

  @IsIn(['FILE', 'MULTI_FILE', 'PROJECT'])
  @IsNotEmpty()
  scope: ReviewScope;

  @IsIn(['SECURITY', 'PERFORMANCE', 'QUALITY'])
  @IsNotEmpty()
  templateType: TemplateType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fileIds?: string[];
}
