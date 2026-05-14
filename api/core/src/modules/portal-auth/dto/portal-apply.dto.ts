import { IsString, IsOptional, MinLength } from 'class-validator';

export class PortalApplyDto {
  @IsString() @MinLength(2) firstName: string;
  @IsString() @MinLength(2) lastName: string;
  @IsString() country: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() message?: string;
}
