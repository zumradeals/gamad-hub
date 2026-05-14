import { IsString, IsOptional, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsUUID() roleId: string;
  @IsUUID() @IsOptional() organizationUnitId?: string;
}
