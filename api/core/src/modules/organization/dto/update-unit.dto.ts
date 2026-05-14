import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class UpdateUnitDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}
