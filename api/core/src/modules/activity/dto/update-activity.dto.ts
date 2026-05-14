import { IsString, IsOptional, IsIn, IsDateString, MinLength } from 'class-validator';

export class UpdateActivityDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'STRATEGIC'])
  priority?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
