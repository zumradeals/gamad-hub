import { IsString, MinLength } from 'class-validator';

export class RemoveMemberDto {
  @IsString()
  @MinLength(5)
  reason: string;
}
