import { IsString, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @MinLength(10)
  content: string;
}
