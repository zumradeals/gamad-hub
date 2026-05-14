import { IsString, MinLength, MaxLength } from 'class-validator';

export class ReactPostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(8)
  emoji: string;
}
