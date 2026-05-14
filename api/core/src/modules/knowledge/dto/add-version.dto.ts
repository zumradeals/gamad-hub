import { IsString, MinLength, IsOptional } from 'class-validator';

export class AddVersionDto {
  @IsString()
  @MinLength(1)
  versionNumber: string;

  @IsString()
  @MinLength(1)
  fileUrl: string;

  @IsString()
  @IsOptional()
  checksum?: string;
}
