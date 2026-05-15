import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ZumaraStatus, ZumaraVisibility } from '@prisma/client';

export class UpdateZumaraCellDto {
  @IsOptional()
  @IsEnum(ZumaraStatus)
  status?: ZumaraStatus;

  @IsOptional()
  @IsEnum(ZumaraVisibility)
  visibility?: ZumaraVisibility;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cotisationAmount?: number;

  @IsOptional()
  @IsString()
  cotisationPeriod?: string;
}
