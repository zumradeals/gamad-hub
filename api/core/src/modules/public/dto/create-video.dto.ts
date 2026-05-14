import { IsString, IsOptional, IsInt, Min, MinLength } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
