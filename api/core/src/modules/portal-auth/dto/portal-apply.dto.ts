import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class PortalApplyDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsString() @IsOptional() country?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() @MaxLength(1000) message?: string;
}
