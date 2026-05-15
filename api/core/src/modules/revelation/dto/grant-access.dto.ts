import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RevelationPath } from '@prisma/client';

export class GrantAccessDto {
  @IsString()
  gamadId: string;

  @IsEnum(RevelationPath)
  path: RevelationPath;

  @IsOptional()
  @IsString()
  note?: string;
}
