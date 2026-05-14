import { IsEmail, IsString, IsOptional, MinLength, IsIn } from 'class-validator';

export class CreateGamadIdDto {
  @IsString()
  @MinLength(2)
  displayName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  @IsIn(['PERSON', 'ORGANIZATION', 'SYSTEM'])
  identityType?: string;
}
