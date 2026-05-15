import { IsString, MinLength } from 'class-validator';

export class SuspendZumaraDto {
  @IsString()
  @MinLength(10)
  reason: string;
}
