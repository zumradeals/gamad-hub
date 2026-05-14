import { IsString, IsOptional } from 'class-validator';

export class EnrollDto {
  @IsString()
  @IsOptional()
  gamadId?: string;
}
