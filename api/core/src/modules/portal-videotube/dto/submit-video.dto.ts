import { IsString, IsUrl, IsOptional, IsArray, IsBoolean, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubmitVideoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  youtubeUrl: string;

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
