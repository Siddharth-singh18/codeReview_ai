import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendChatMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Message content is required' })
  message: string;

  @IsString()
  @IsNotEmpty({ message: 'AI Provider configuration ID is required' })
  providerId: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}
