import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  OrganizationUnitType,
  OrganizationUnitStatus,
  MembershipType,
  MembershipStatus,
  ZumaraVisibility,
} from '@prisma/client';

const UNIT_INCLUDE = {
  parent: { select: { id: true, name: true, type: true } },
  children: { select: { id: true, name: true, type: true, status: true } },
  zumara: true,
  _count: { select: { memberships: true, activities: true } },
};

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Units ────────────────────────────────────────────────────────────────

  findAllUnits(opts?: { type?: string; status?: string; parentId?: string }) {
    const where: any = {};
    if (opts?.type) where.type = opts.type as OrganizationUnitType;
    if (opts?.status) where.status = opts.status as OrganizationUnitStatus;
    if (opts?.parentId !== undefined)
      where.parentId = opts.parentId === 'null' ? null : opts.parentId;
    return this.prisma.organizationUnit.findMany({
      where,
      include: UNIT_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  findUnitById(id: string) {
    return this.prisma.organizationUnit.findUnique({
      where: { id },
      include: {
        ...UNIT_INCLUDE,
        memberships: {
          where: { status: MembershipStatus.ACTIVE },
          include: { gamad: { include: { profile: true } } },
        },
      },
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
        parentId: data.parentId ?? null,
        description: data.description,
        status: OrganizationUnitStatus.ACTIVE,
      },
      include: UNIT_INCLUDE,
    });
  }

  updateUnit(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      status: OrganizationUnitStatus;
      parentId: string | null;
    }>,
  ) {
    return this.prisma.organizationUnit.update({
      where: { id },
      data,
      include: UNIT_INCLUDE,
    });
  }

  archiveUnit(id: string) {
    return this.prisma.organizationUnit.update({
      where: { id },
      data: { status: OrganizationUnitStatus.ARCHIVED },
    });
  }

  // ── Memberships ───────────────────────────────────────────────────────────

  findMemberships(organizationUnitId: string) {
    return this.prisma.membership.findMany({
      where: { organizationUnitId, status: MembershipStatus.ACTIVE },
      include: {
        gamad: { include: { profile: true, account: { select: { email: true } } } },
      },
    });
  }

  findMembership(gamadId: string, organizationUnitId: string) {
    return this.prisma.membership.findFirst({
      where: { gamadId, organizationUnitId, status: MembershipStatus.ACTIVE },
    });
  }

  createMembership(data: {
    gamadId: string;
    organizationUnitId: string;
    membershipType: MembershipType;
  }) {
    return this.prisma.membership.create({
      data: {
        gamadId: data.gamadId,
        organizationUnitId: data.organizationUnitId,
        membershipType: data.membershipType,
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      },
      include: {
        gamad: { include: { profile: true } },
        organizationUnit: { select: { id: true, name: true } },
      },
    });
  }

  removeMembership(membershipId: string) {
    return this.prisma.membership.update({
      where: { id: membershipId },
      data: { status: MembershipStatus.ARCHIVED, leftAt: new Date() },
    });
  }

  findMembershipById(id: string) {
    return this.prisma.membership.findUnique({ where: { id } });
  }

  // ── Zumara ────────────────────────────────────────────────────────────────

  findAllZumara() {
    return this.prisma.zumara.findMany({
      include: {
        organizationUnit: {
          include: {
            _count: { select: { memberships: true } },
          },
        },
      },
    });
  }

  findZumaraById(id: string) {
    return this.prisma.zumara.findUnique({
      where: { id },
      include: {
        organizationUnit: {
          include: {
            memberships: {
              where: { status: MembershipStatus.ACTIVE },
              include: { gamad: { include: { profile: true } } },
            },
          },
        },
      },
    });
  }

  findZumaraByUnitId(organizationUnitId: string) {
    return this.prisma.zumara.findUnique({
      where: { organizationUnitId },
      include: { organizationUnit: true },
    });
  }

  createZumara(data: {
    organizationUnitId: string;
    activityDomain?: string;
    mission?: string;
    visibility?: ZumaraVisibility;
  }) {
    return this.prisma.zumara.create({
      data: {
        organizationUnitId: data.organizationUnitId,
        activityDomain: data.activityDomain,
        mission: data.mission,
        visibility: data.visibility ?? ZumaraVisibility.INTERNAL,
      },
      include: { organizationUnit: true },
    });
  }

  updateZumara(
    id: string,
    data: Partial<{
      activityDomain: string;
      mission: string;
      visibility: ZumaraVisibility;
    }>,
  ) {
    return this.prisma.zumara.update({
      where: { id },
      data,
      include: { organizationUnit: true },
    });
  }
}
