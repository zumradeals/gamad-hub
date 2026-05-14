import { IsString, IsOptional, IsIn, IsBoolean, MinLength } from 'class-validator';

export class CreateThreadDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  organizationUnitId?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PUBLIC', 'INTERNAL', 'UNIT', 'PRIVATE'])
  visibility?: string;
}
