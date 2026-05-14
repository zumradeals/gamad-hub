import { IsString, MinLength } from 'class-validator';

export class ValidateIdentityDto {
  @IsString()
  @MinLength(5)
  decisionNote: string;
}
