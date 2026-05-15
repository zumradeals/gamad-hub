import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ZumaraType } from '@prisma/client';

export class CreateZumaraRequestDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(50)
  objective: string;

  @IsEnum(ZumaraType)
  type: ZumaraType;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  city?: string;
}
