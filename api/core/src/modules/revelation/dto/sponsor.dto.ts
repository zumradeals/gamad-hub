import { IsOptional, IsString } from 'class-validator';

export class SponsorDto {
  @IsString()
  gamadId: string;

  @IsOptional()
  @IsString()
  note?: string;
}
