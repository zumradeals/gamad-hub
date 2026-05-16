import { IsString, IsNotEmpty } from 'class-validator';

export class GrantRoleDto {
  @IsString() @IsNotEmpty() gamadId: string;
  @IsString() @IsNotEmpty() role: string;
}
