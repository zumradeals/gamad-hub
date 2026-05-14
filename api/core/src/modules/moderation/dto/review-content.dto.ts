import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewContentDto {
  @IsBoolean()
  approve: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
