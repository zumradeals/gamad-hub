import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateFeedPostDto {
  @IsString() @IsNotEmpty() @MaxLength(1000) content: string;
  @IsUrl() @IsOptional() imageUrl?: string;
  @IsString() @IsOptional() cellId?: string;
}
