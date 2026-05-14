import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportReason } from '@prisma/client';

export class ReportContentDto {
  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
