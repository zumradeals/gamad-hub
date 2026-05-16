import {
  Body, Controller, Delete, Get, Param, Post, Req, UseGuards,
} from '@nestjs/common';
import { ModuleConfigService } from './module-config.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { SetConfigDto } from './dto/set-config.dto';
import { GrantRoleDto } from './dto/grant-role.dto';

@Controller('governance/modules')
@UseGuards(PermissionGuard)
export class ModuleConfigController {
  constructor(private readonly svc: ModuleConfigService) {}

  @Get(':module/config')
  listConfig(@Param('module') module: string) {
    return this.svc.listModule(module.toUpperCase());
  }

  @Post(':module/config/:key')
  setConfig(
    @Param('module') module: string,
    @Param('key') key: string,
    @Body() dto: SetConfigDto,
    @Req() req: any,
  ) {
    return this.svc.set(module.toUpperCase(), key, dto.value, req.actorId);
  }

  @Get(':module/roles')
  listRoles(@Param('module') module: string) {
    return this.svc.listRoles(module.toUpperCase());
  }

  @Post(':module/roles')
  grantRole(
    @Param('module') module: string,
    @Body() dto: GrantRoleDto,
    @Req() req: any,
  ) {
    return this.svc.grantRole(module.toUpperCase(), dto.gamadId, dto.role, req.actorId);
  }

  @Delete(':module/roles/:gamadId/:role')
  revokeRole(
    @Param('module') module: string,
    @Param('gamadId') gamadId: string,
    @Param('role') role: string,
  ) {
    return this.svc.revokeRole(module.toUpperCase(), gamadId, role);
  }
}
