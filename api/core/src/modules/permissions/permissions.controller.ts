import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ActorId } from '../../common/decorators/actor.decorator';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get('roles')
  @UseGuards(PermissionGuard)
  findAllRoles() {
    return this.service.findAllRoles();
  }

  @Get('permissions')
  @UseGuards(PermissionGuard)
  findAllPermissions() {
    return this.service.findAllPermissions();
  }

  @Get('members/:gamadId/roles')
  @UseGuards(PermissionGuard)
  findMemberRoles(@Param('gamadId') gamadId: string) {
    return this.service.findMemberRoles(gamadId);
  }

  @Post('members/:gamadId/roles')
  @UseGuards(PermissionGuard)
  assignRole(
    @Param('gamadId') gamadId: string,
    @Body() dto: AssignRoleDto,
    @ActorId() actorId: string,
  ) {
    return this.service.assignRole(gamadId, dto, actorId);
  }

  @Delete('members/:gamadId/roles/:memberRoleId')
  @UseGuards(PermissionGuard)
  revokeRole(
    @Param('gamadId') gamadId: string,
    @Param('memberRoleId') memberRoleId: string,
    @ActorId() actorId: string,
  ) {
    return this.service.revokeRole(gamadId, memberRoleId, actorId);
  }
}
