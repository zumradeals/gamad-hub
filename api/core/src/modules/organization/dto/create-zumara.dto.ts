import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateZumaraDto {
  @IsString()
  @IsOptional()
  activityDomain?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  mission?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PUBLIC', 'INTERNAL', 'PRIVATE'])
  visibility?: string;
}
