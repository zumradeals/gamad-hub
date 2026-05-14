import { IsString, IsNumber, IsDateString, MinLength, Min } from 'class-validator';

export class CreatePeriodDto {
  @IsString()
  @MinLength(3)
  label: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
