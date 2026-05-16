import { IsNotEmpty, IsOptional, IsString, MaxLength, IsEmail, IsUrl } from 'class-validator';

export class CreatePageDto {
  @IsString() @IsNotEmpty() @MaxLength(80)  name: string;
  @IsString() @IsNotEmpty() @MaxLength(80)  slug: string;
  @IsString() @IsOptional() @MaxLength(160) tagline?: string;
  @IsString() @IsOptional() @MaxLength(1000) description?: string;
  @IsString() @IsOptional() category?: string;
  @IsEmail()  @IsOptional() email?: string;
  @IsString() @IsOptional() country?: string;
  @IsString() @IsOptional() city?: string;
}
