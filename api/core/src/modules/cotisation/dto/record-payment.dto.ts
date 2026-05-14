import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class RecordPaymentDto {
  @IsString()
  periodId: string;

  @IsString()
  @IsOptional()
  gamadId?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}
