import {
  IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength,
} from 'class-validator';

export class CreateArticleDto {
  @IsString() @IsNotEmpty() @MinLength(5) @MaxLength(200) title: string;
  @IsString() @IsNotEmpty() @MinLength(10) content: string;
  @IsString() @IsOptional() @MaxLength(400) excerpt?: string;
  @IsString() @IsOptional() imageUrl?: string;
  @IsString() @IsOptional() videoUrl?: string;
  @IsArray() @IsString({ each: true }) @IsOptional() tags?: string[];
  @IsBoolean() @IsOptional() sponsored?: boolean;
  @IsString() @IsOptional() @MaxLength(100) sponsorName?: string;
  @IsString() @IsOptional() sponsorUrl?: string;
  @IsString() @IsOptional() categoryId?: string;
}
