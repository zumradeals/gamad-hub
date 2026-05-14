import { IsString, MinLength } from 'class-validator';

export class ArchiveUnitDto {
  @IsString()
  @MinLength(10)
  reason: string;
}
