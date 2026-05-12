import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MembershipType, OrganizationUnitType, ProfileVisibility } from "@prisma/client";
import { PermissionsService } from "../permissions/permissions.service";
import { ArchiveUnitDto } from "./dto/archive-unit.dto";
import { AssignMemberDto } from "./dto/assign-member.dto";
import { AssignResponsibleDto } from "./dto/assign-responsible.dto";
import { CreateOrganizationUnitDto } from "./dto/create-organization-unit.dto";
import { CreateZumaraDto } from "./dto/create-zumara.dto";
import { OrganizationRepository } from "./organization.repository";

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly permissionsService: PermissionsService
  ) {}

  async listUnits(actorId: string | undefined, query?: { skip?: number; take?: number }) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "organization.read" });
    const skip = Math.max(query?.skip ?? 0, 0);
    const take = Math.min(Math.max(query?.take ?? 100, 1), 500);
    const [items, total] = await Promise.all([
      this.organizationRepository.listUnits({ skip, take }),
      this.organizationRepository.countUnits()
    ]);
    return { items, total, skip, take };
  }

  async createUnit(actorId: string | undefined, dto: CreateOrganizationUnitDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "organization.create" });
    this.assertName(dto.name);

    if (dto.parentId) {
      await this.assertUnitExists(dto.parentId);
    }

    const unit = await this.organizationRepository.createUnit({
      name: dto.name,
      type: this.toUnitType(dto.type),
      parentId: dto.parentId,
      description: dto.description
    });

    await this.organizationRepository.writeAudit({
      actorId,
      action: "ORGANIZATION_UNIT_CREATED",
      targetType: "ORGANIZATION_UNIT",
      targetId: unit.id,
      organizationUnitId: unit.id,
      newValue: unit
    });

    return unit;
  }

  async readUnit(actorId: string | undefined, id: string) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "organization.read", organizationUnitId: id });
    const unit = await this.organizationRepository.findUnit(id);
    if (!unit) {
      throw new NotFoundException("Organization unit not found");
    }
    return unit;
  }

  async createZumara(actorId: string | undefined, dto: CreateZumaraDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "organization.create" });
    this.assertName(dto.name);
    if (!dto.activityDomain?.trim()) {
      throw new BadRequestException("activityDomain is required");
    }
    if (dto.parentId) {
      await this.assertUnitExists(dto.parentId);
    }

    const unit = await this.organizationRepository.createZumara({
      name: dto.name,
      parentId: dto.parentId,
      description: dto.description,
      activityDomain: dto.activityDomain,
      mission: dto.mission,
      visibility: dto.visibility ?? ProfileVisibility.INTERNAL
    });

    await this.organizationRepository.writeAudit({
      actorId,
      action: "ZUMARA_CREATED",
      targetType: "ORGANIZATION_UNIT",
      targetId: unit.id,
      organizationUnitId: unit.id,
      newValue: unit
    });

    return unit;
  }

  async assignMember(actorId: string | undefined, unitId: string, dto: AssignMemberDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "organization.assign_member", organizationUnitId: unitId });
    await this.assertUnitExists(unitId);
    await this.assertActiveIdentity(dto.gamadId);

    const membership = await this.organizationRepository.upsertMembership({
      gamadId: dto.gamadId,
      organizationUnitId: unitId,
      membershipType: this.toMembershipType(dto.membershipType ?? "member")
    });

    await this.organizationRepository.writeAudit({
      actorId,
      action: "MEMBER_ATTACHED_TO_UNIT",
      targetType: "MEMBERSHIP",
      targetId: membership.id,
      organizationUnitId: unitId,
      newValue: membership
    });

    return membership;
  }

  async removeMember(actorId: string | undefined, unitId: string, gamadId: string) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "organization.assign_member", organizationUnitId: unitId });
    const membership = await this.organizationRepository.findActiveMembership(gamadId, unitId);
    if (!membership) {
      throw new NotFoundException("Active membership not found");
    }

    const archived = await this.organizationRepository.archiveMembership(membership.id);
    await this.organizationRepository.writeAudit({
      actorId,
      action: "MEMBER_REMOVED_FROM_UNIT",
      targetType: "MEMBERSHIP",
      targetId: archived.id,
      organizationUnitId: unitId,
      oldValue: membership,
      newValue: archived
    });

    return archived;
  }

  async assignResponsible(actorId: string | undefined, unitId: string, dto: AssignResponsibleDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "organization.assign_member", organizationUnitId: unitId });
    if (!actorId) {
      throw new BadRequestException("actor is required");
    }
    if (!dto.reason?.trim()) {
      throw new BadRequestException("reason is required");
    }
    await this.assertUnitExists(unitId);
    await this.assertActiveIdentity(dto.gamadId);

    const membership = await this.organizationRepository.upsertMembership({
      gamadId: dto.gamadId,
      organizationUnitId: unitId,
      membershipType: MembershipType.RESPONSIBLE
    });

    const roleAssignment = dto.roleId
      ? await this.organizationRepository.assignRole({
          gamadId: dto.gamadId,
          roleId: dto.roleId,
          organizationUnitId: unitId,
          grantedBy: actorId
        })
      : null;

    await this.organizationRepository.writeAudit({
      actorId,
      action: "RESPONSIBLE_ASSIGNED",
      targetType: "ORGANIZATION_UNIT",
      targetId: unitId,
      organizationUnitId: unitId,
      newValue: { membership, roleAssignment, reason: dto.reason }
    });

    return { membership, roleAssignment };
  }

  async archiveUnit(actorId: string | undefined, unitId: string, dto: ArchiveUnitDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "organization.archive", organizationUnitId: unitId });
    if (!dto.reason?.trim()) {
      throw new BadRequestException("reason is required");
    }

    const before = await this.assertUnitExists(unitId);
    const archived = await this.organizationRepository.archiveUnit(unitId);

    await this.organizationRepository.writeAudit({
      actorId,
      action: "ORGANIZATION_UNIT_ARCHIVED",
      targetType: "ORGANIZATION_UNIT",
      targetId: unitId,
      organizationUnitId: unitId,
      oldValue: { status: before.status },
      newValue: { status: archived.status, reason: dto.reason }
    });

    return archived;
  }

  private async assertUnitExists(id: string) {
    const unit = await this.organizationRepository.findUnit(id);
    if (!unit) {
      throw new NotFoundException("Organization unit not found");
    }
    return unit;
  }

  private async assertActiveIdentity(id: string) {
    const identity = await this.organizationRepository.findIdentity(id);
    if (!identity) {
      throw new NotFoundException("GAMAD ID not found");
    }
    if (identity.status !== "ACTIVE") {
      throw new BadRequestException("GAMAD ID must be ACTIVE");
    }
  }

  private assertName(name: string) {
    if (!name?.trim()) {
      throw new BadRequestException("name is required");
    }
  }

  private toUnitType(value: string) {
    const normalized = value.toUpperCase();
    if (!["HCG", "DEPARTMENT", "COORDINATION", "SECTION", "ZUMARA"].includes(normalized)) {
      throw new BadRequestException("invalid organization unit type");
    }
    return normalized as OrganizationUnitType;
  }

  private toMembershipType(value: string) {
    const normalized = value.toUpperCase();
    if (!["MEMBER", "RESPONSIBLE", "ASSISTANT", "OBSERVER"].includes(normalized)) {
      throw new BadRequestException("invalid membership type");
    }
    return normalized as MembershipType;
  }
}
