import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class PortalRegisterDto {
  @IsString() @MinLength(2) firstName: string;
  @IsString() @MinLength(2) lastName: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() @IsOptional() country?: string;
  @IsString() @IsOptional() city?: string;
}
