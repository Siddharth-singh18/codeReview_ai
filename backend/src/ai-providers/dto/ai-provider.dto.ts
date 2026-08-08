import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export type ProviderType = 'OPENAI' | 'GROQ' | 'LM_STUDIO' | 'OLLAMA' | 'OPENROUTER' | 'GENERIC';

export class CreateAIProviderConfigDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Base URL is required' })
  baseUrl: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsNotEmpty({ message: 'Model name is required' })
  modelName: string;

  @IsIn(['OPENAI', 'GROQ', 'LM_STUDIO', 'OLLAMA', 'OPENROUTER', 'GENERIC'])
  @IsOptional()
  providerType?: ProviderType;
}

export class UpdateAIProviderConfigDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  baseUrl?: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  modelName?: string;

  @IsIn(['OPENAI', 'GROQ', 'LM_STUDIO', 'OLLAMA', 'OPENROUTER', 'GENERIC'])
  @IsOptional()
  providerType?: ProviderType;
}
