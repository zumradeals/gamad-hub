import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewVideoDto {
  @IsIn(['approve', 'reject'])
  decision: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  note?: string;
}
