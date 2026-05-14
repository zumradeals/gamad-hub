import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateUnitDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsIn(['HCG', 'DEPARTMENT', 'COORDINATION', 'SECTION', 'ZUMARA'])
  type: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
