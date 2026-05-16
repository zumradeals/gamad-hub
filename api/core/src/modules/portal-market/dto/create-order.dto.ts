import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MarketPaymentMethod } from '@prisma/client';

export class CreateOrderDto {
  @IsInt() @Min(1) @IsOptional() quantity?: number;
  @IsEnum(MarketPaymentMethod) paymentMethod: MarketPaymentMethod;
  @IsString() @IsOptional() note?: string;
}
