import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePagePostDto {
  @IsString() @IsNotEmpty() @MaxLength(2000) content: string;
  @IsString() @IsOptional() imageUrl?: string;
}
