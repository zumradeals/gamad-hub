import { IsString, IsOptional, IsArray, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateVideoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  durationMin?: number;

  @IsOptional()
  @IsBoolean()
  sponsored?: boolean;

  @IsOptional()
  @IsString()
  sponsorName?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  channelId?: string;
}
