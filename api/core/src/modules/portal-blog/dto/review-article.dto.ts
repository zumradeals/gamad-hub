import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewArticleDto {
  @IsIn(['approve', 'reject']) action: 'approve' | 'reject';
  @IsString() @IsOptional() note?: string;
}
