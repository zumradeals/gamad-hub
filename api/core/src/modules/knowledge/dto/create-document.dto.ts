import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  @IsIn(['STATUTE', 'REPORT', 'MANUAL', 'PROCEDURE', 'MEDIA', 'ARCHIVE', 'TRAINING'])
  documentType?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'STRATEGIC'])
  classification?: string;

  @IsString()
  @IsOptional()
  organizationUnitId?: string;
}
