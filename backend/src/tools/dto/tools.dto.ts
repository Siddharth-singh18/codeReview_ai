import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateDocsDto {
  @IsString()
  @IsNotEmpty({ message: 'AI Provider configuration ID is required' })
  providerId: string;
}

export class ScanTechDebtDto {
  @IsString()
  @IsNotEmpty({ message: 'AI Provider configuration ID is required' })
  providerId: string;
}
