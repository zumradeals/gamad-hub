import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PortalLoginDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() password: string;
}
