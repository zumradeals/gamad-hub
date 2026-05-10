import { Injectable } from "@nestjs/common";
import { MembershipType, OrganizationUnitStatus, OrganizationUnitType, ProfileVisibility } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUnit(id: string) {
    return this.prisma.organizationUnit.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        zumara: true,
        memberships: {
          include: {
            gamadIdentity: {
              include: { profile: true }
            }
          }
        }
      }
    });
  }

  createUnit(data: {
    name: string;
    type: OrganizationUnitType;
    parentId?: string;
    description?: string;
  }) {
    return this.prisma.organizationUnit.create({
      data: {
        name: data.name,
        type: data.type,
        parentId: data.parentId,
        description: data.description
      }
    });
  }

  createZumara(data: {
    name: string;
    parentId?: string;
    description?: string;
    activityDomain: string;
    mission?: string;
    visibility: ProfileVisibility;
  }) {
    return this.prisma.organizationUnit.create({
      data: {
        name: data.name,
        type: OrganizationUnitType.ZUMARA,
        parentId: data.parentId,
        description: data.description,
        zumara: {
          create: {
            activityDomain: data.activityDomain,
            mission: data.mission,
            visibility: data.visibility
          }
        }
      },
      include: { zumara: true }
    });
  }

  findIdentity(id: string) {
    return this.prisma.gamadId.findUnique({
      where: { id },
      select: { id: true, status: true }
    });
  }

  upsertMembership(data: {
    gamadId: string;
    organizationUnitId: string;
    membershipType: MembershipType;
  }) {
    return this.prisma.membership.create({
      data: {
        gamadId: data.gamadId,
        organizationUnitId: data.organizationUnitId,
        membershipType: data.membershipType,
        status: "ACTIVE",
        joinedAt: new Date()
      }
    });
  }

  archiveMembership(id: string) {
    return this.prisma.membership.update({
      where: { id },
      data: {
        status: "ARCHIVED",
        leftAt: new Date()
      }
    });
  }

  findActiveMembership(gamadId: string, organizationUnitId: string) {
    return this.prisma.membership.findFirst({
      where: {
        gamadId,
        organizationUnitId,
        status: "ACTIVE"
      }
    });
  }

  archiveUnit(id: string) {
    return this.prisma.organizationUnit.update({
      where: { id },
      data: { status: OrganizationUnitStatus.ARCHIVED }
    });
  }

  assignRole(data: { gamadId: string; roleId: string; organizationUnitId: string; grantedBy: string }) {
    return this.prisma.memberRole.create({
      data: {
        gamadId: data.gamadId,
        roleId: data.roleId,
        organizationUnitId: data.organizationUnitId,
        grantedBy: data.grantedBy
      }
    });
  }

  writeAudit(input: {
    actorId?: string;
    action: string;
    targetType: string;
    targetId?: string;
    organizationUnitId?: string;
    oldValue?: unknown;
    newValue?: unknown;
  }) {
    return this.prisma.auditEvent.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        organizationUnitId: input.organizationUnitId,
        oldValue: input.oldValue === undefined ? undefined : JSON.parse(JSON.stringify(input.oldValue)),
        newValue: input.newValue === undefined ? undefined : JSON.parse(JSON.stringify(input.newValue))
      }
    });
  }
}
