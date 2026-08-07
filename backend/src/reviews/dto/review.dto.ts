import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { ReviewScope, TemplateType } from '@prisma/client';

export class TriggerReviewDto {
  @IsString()
  @IsNotEmpty({ message: 'AI Provider configuration ID is required' })
  providerId: string;

  @IsEnum(ReviewScope)
  @IsNotEmpty()
  scope: ReviewScope;

  @IsEnum(TemplateType)
  @IsNotEmpty()
  templateType: TemplateType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fileIds?: string[];
}
