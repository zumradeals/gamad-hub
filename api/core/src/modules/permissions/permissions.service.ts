import { Injectable } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private readonly repo: PermissionsRepository) {}

  findAllRoles() {
    return this.repo.findAllRoles();
  }

  findAllPermissions() {
    return this.repo.findAllPermissions();
  }
}
