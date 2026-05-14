import { IsString, MinLength } from 'class-validator';

export class RejectActivityDto {
  @IsString()
  @MinLength(5)
  reason: string;
}
