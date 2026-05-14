import { IsString, MinLength } from 'class-validator';

export class SuspendIdentityDto {
  @IsString()
  @MinLength(10)
  reason: string;
}
