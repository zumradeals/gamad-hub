import { Controller, Get } from '@nestjs/common';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get('roles')
  findAllRoles() {
    return this.service.findAllRoles();
  }

  @Get('permissions')
  findAllPermissions() {
    return this.service.findAllPermissions();
  }
}
