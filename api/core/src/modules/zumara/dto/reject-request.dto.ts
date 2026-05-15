import { IsString, MinLength } from 'class-validator';

export class RejectRequestDto {
  @IsString()
  @MinLength(10)
  reason: string;
}
