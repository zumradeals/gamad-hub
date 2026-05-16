import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PageProductType } from '@prisma/client';

export class CreatePageProductDto {
  @IsString() @IsNotEmpty() @MaxLength(120)  name: string;
  @IsString() @IsOptional() @MaxLength(500)  description?: string;
  @IsString() @IsOptional() imageUrl?: string;
  @IsNumber() @IsOptional() @Min(0) price?: number;
  @IsString() @IsOptional() currency?: string;
  @IsEnum(PageProductType) @IsOptional() type?: PageProductType;
  @IsBoolean() @IsOptional() available?: boolean;
}
