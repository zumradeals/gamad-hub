import { IsString, IsIn, IsOptional } from 'class-validator';

export class AssignMemberDto {
  @IsString()
  gamadId: string;

  @IsString()
  @IsOptional()
  @IsIn(['MEMBER', 'RESPONSIBLE', 'ASSISTANT', 'OBSERVER'])
  membershipType?: string;
}
