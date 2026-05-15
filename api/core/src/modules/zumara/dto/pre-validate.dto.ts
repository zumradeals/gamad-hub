import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class PreValidateDto {
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(365)
  deadlineDays?: number;
}
