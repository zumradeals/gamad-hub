import { IsString, IsOptional } from 'class-validator';

export class ReviewApplicationDto {
  @IsString() @IsOptional() reviewNote?: string;
}
