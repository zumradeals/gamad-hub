import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class UpdateThreadDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  title?: string;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;
}
