import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ProviderType } from '@prisma/client';

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

  @IsEnum(ProviderType)
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

  @IsEnum(ProviderType)
  @IsOptional()
  providerType?: ProviderType;
}
