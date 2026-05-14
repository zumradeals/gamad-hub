import { IsString, IsOptional, IsIn, MinLength, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsString()
  @MinLength(1)
  q: string;

  @IsString()
  @IsOptional()
  @IsIn(['all', 'articles', 'videos', 'formations', 'resources'])
  type?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @Type(() => Number)
  take?: number;
}
