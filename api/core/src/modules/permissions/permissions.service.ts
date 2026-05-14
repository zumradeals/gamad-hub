import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';
import { AuditService } from '../audit/audit.service';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly repo: PermissionsRepository,
    private readonly audit: AuditService,
  ) {}

  findAllRoles() {
    return this.repo.findAllRoles();
  }

  findAllPermissions() {
    return this.repo.findAllPermissions();
  }

  findMemberRoles(gamadId: string) {
    return this.repo.findMemberRoles(gamadId);
  }

  async assignRole(gamadId: string, dto: AssignRoleDto, actorId: string) {
    // Prevent duplicate active assignment
    const existing = await this.repo.findMemberRoles(gamadId);
    const alreadyAssigned = existing.find(
      mr => mr.roleId === dto.roleId &&
            (mr.organizationUnitId ?? null) === (dto.organizationUnitId ?? null),
    );
    if (alreadyAssigned) throw new ConflictException('Ce rôle est déjà assigné à ce membre');

    const assignment = await this.repo.assignRole({
      gamadId,
      roleId: dto.roleId,
      grantedBy: actorId,
      organizationUnitId: dto.organizationUnitId,
    });

    await this.audit.createEvent({
      actorId,
      action: 'ROLE_ASSIGNED',
      targetType: 'GamadId',
      targetId: gamadId,
      newValue: { roleId: dto.roleId, roleName: assignment.role.name, organizationUnitId: dto.organizationUnitId },
    });

    return assignment;
  }

  async revokeRole(gamadId: string, memberRoleId: string, actorId: string) {
    const mr = await this.repo.findMemberRoleById(memberRoleId);
    if (!mr || mr.gamadId !== gamadId) throw new NotFoundException('Assignation introuvable');
    if (mr.revokedAt) throw new ConflictException('Ce rôle a déjà été révoqué');

    await this.repo.revokeRole(memberRoleId);

    await this.audit.createEvent({
      actorId,
      action: 'ROLE_REVOKED',
      targetType: 'GamadId',
      targetId: gamadId,
      newValue: { memberRoleId },
    });

    return { success: true, memberRoleId };
  }
}
