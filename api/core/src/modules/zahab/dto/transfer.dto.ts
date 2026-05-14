import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class TransferDto {
  @IsString() @IsNotEmpty() toGamadId: string;
  @IsNumber() @IsPositive() amount: number;
  @IsString() @IsOptional() note?: string;
}
