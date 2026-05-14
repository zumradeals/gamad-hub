import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllRoles() {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
  }

  findAllPermissions() {
    return this.prisma.permission.findMany();
  }

  findMemberRoles(gamadId: string) {
    return this.prisma.memberRole.findMany({
      where: { gamadId, revokedAt: null },
      include: {
        role: { select: { id: true, name: true, description: true, scope: true } },
        organizationUnit: { select: { id: true, name: true, type: true } },
      },
      orderBy: { grantedAt: 'desc' },
    });
  }

  findMemberRoleById(id: string) {
    return this.prisma.memberRole.findUnique({ where: { id } });
  }

  assignRole(data: { gamadId: string; roleId: string; grantedBy: string; organizationUnitId?: string }) {
    return this.prisma.memberRole.create({
      data: {
        gamadId: data.gamadId,
        roleId: data.roleId,
        grantedBy: data.grantedBy,
        organizationUnitId: data.organizationUnitId,
        grantedAt: new Date(),
      },
      include: {
        role: { select: { id: true, name: true, description: true } },
      },
    });
  }

  revokeRole(memberRoleId: string) {
    return this.prisma.memberRole.update({
      where: { id: memberRoleId },
      data: { revokedAt: new Date() },
    });
  }
}
