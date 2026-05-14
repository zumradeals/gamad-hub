import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsString()
  @IsOptional()
  organizationUnitId?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PUBLIC', 'INTERNAL', 'UNIT', 'ROLE'])
  audienceScope?: string;
}
