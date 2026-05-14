import { IsString, IsOptional, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  recipientId: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsString()
  @IsOptional()
  organizationUnitId?: string;
}
