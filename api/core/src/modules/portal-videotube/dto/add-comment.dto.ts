import { IsString, MinLength, MaxLength } from 'class-validator';

export class AddCommentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  content: string;
}
