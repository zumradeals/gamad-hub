import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
