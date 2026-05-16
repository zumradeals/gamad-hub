import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFeedCommentDto {
  @IsString() @IsNotEmpty() @MaxLength(500) content: string;
}
