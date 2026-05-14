import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationRepository } from './organization.repository';
import { AuditService } from '../audit/audit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { AssignMemberDto } from './dto/assign-member.dto';
import { ArchiveUnitDto } from './dto/archive-unit.dto';
import { CreateZumaraDto } from './dto/create-zumara.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import {
  OrganizationUnitType,
  OrganizationUnitStatus,
  MembershipType,
  ZumaraVisibility,
} from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly repo: OrganizationRepository,
    private readonly audit: AuditService,
  ) {}

  // ── Units ────────────────────────────────────────────────────────────────

  findAllUnits(opts?: { type?: string; status?: string; parentId?: string }) {
    return this.repo.findAllUnits(opts);
  }

  async findUnitById(id: string) {
    const unit = await this.repo.findUnitById(id);
    if (!unit) throw new NotFoundException('Unité organisationnelle introuvable');
    return unit;
  }

  async createUnit(dto: CreateUnitDto, actorId: string) {
    const unit = await this.repo.createUnit({
      name: dto.name,
      type: dto.type as OrganizationUnitType,
      parentId: dto.parentId,
      description: dto.description,
    });

    await this.audit.createEvent({
      actorId,
      action: 'ORGANIZATION_UNIT_CREATED',
      targetType: 'OrganizationUnit',
      targetId: unit.id,
      newValue: { name: unit.name, type: unit.type, parentId: unit.parentId },
    });

    return unit;
  }

  async updateUnit(id: string, dto: UpdateUnitDto, actorId: string) {
    const existing = await this.repo.findUnitById(id);
    if (!existing) throw new NotFoundException('Unité organisationnelle introuvable');
    if (existing.status === OrganizationUnitStatus.ARCHIVED) {
      throw new BadRequestException('Impossible de modifier une unité archivée');
    }

    const updated = await this.repo.updateUnit(id, {
      name: dto.name,
      description: dto.description,
      status: dto.status as OrganizationUnitStatus | undefined,
      parentId: dto.parentId ?? undefined,
    });

    await this.audit.createEvent({
      actorId,
      action: 'ORGANIZATION_UNIT_UPDATED',
      targetType: 'OrganizationUnit',
      targetId: id,
      oldValue: { name: existing.name, description: existing.description },
      newValue: dto,
    });

    return updated;
  }

  async archiveUnit(id: string, dto: ArchiveUnitDto, actorId: string) {
    const existing = await this.repo.findUnitById(id);
    if (!existing) throw new NotFoundException('Unité organisationnelle introuvable');
    if (existing.status === OrganizationUnitStatus.ARCHIVED) {
      throw new BadRequestException('Cette unité est déjà archivée');
    }

    await this.repo.archiveUnit(id);

    await this.audit.createEvent({
      actorId,
      action: 'ORGANIZATION_UNIT_ARCHIVED',
      targetType: 'OrganizationUnit',
      targetId: id,
      oldValue: { status: existing.status },
      newValue: { status: 'ARCHIVED', reason: dto.reason },
    });

    return { success: true, id, status: 'ARCHIVED' };
  }

  // ── Members ──────────────────────────────────────────────────────────────

  async findMembers(unitId: string) {
    await this.findUnitById(unitId);
    return this.repo.findMemberships(unitId);
  }

  async assignMember(unitId: string, dto: AssignMemberDto, actorId: string) {
    const unit = await this.repo.findUnitById(unitId);
    if (!unit) throw new NotFoundException('Unité organisationnelle introuvable');

    const existing = await this.repo.findMembership(dto.gamadId, unitId);
    if (existing) {
      throw new ConflictException('Ce membre est déjà affecté à cette unité');
    }

    const membership = await this.repo.createMembership({
      gamadId: dto.gamadId,
      organizationUnitId: unitId,
      membershipType: (dto.membershipType as MembershipType) ?? MembershipType.MEMBER,
    });

    await this.audit.createEvent({
      actorId,
      action: 'MEMBER_ATTACHED_TO_UNIT',
      targetType: 'Membership',
      targetId: membership.id,
      organizationUnitId: unitId,
      newValue: {
        gamadId: dto.gamadId,
        unitId,
        membershipType: membership.membershipType,
      },
    });

    return membership;
  }

  async removeMember(unitId: string, membershipId: string, dto: RemoveMemberDto, actorId: string) {
    const membership = await this.repo.findMembershipById(membershipId);
    if (!membership || membership.organizationUnitId !== unitId) {
      throw new NotFoundException('Membre introuvable dans cette unité');
    }

    await this.repo.removeMembership(membershipId);

    await this.audit.createEvent({
      actorId,
      action: 'MEMBER_REMOVED_FROM_UNIT',
      targetType: 'Membership',
      targetId: membershipId,
      organizationUnitId: unitId,
      newValue: { reason: dto.reason },
    });

    return { success: true, membershipId };
  }

  // ── Zumara ────────────────────────────────────────────────────────────────

  findAllZumara() {
    return this.repo.findAllZumara();
  }

  async findZumaraById(id: string) {
    const z = await this.repo.findZumaraById(id);
    if (!z) throw new NotFoundException('Zumara introuvable');
    return z;
  }

  async createZumara(unitId: string, dto: CreateZumaraDto, actorId: string) {
    const unit = await this.repo.findUnitById(unitId);
    if (!unit) throw new NotFoundException('Unité organisationnelle introuvable');
    if (unit.type !== OrganizationUnitType.ZUMARA) {
      throw new BadRequestException('Cette unité n\'est pas de type ZUMARA');
    }

    const existing = await this.repo.findZumaraByUnitId(unitId);
    if (existing) throw new ConflictException('Un Zumara existe déjà pour cette unité');

    const zumara = await this.repo.createZumara({
      organizationUnitId: unitId,
      activityDomain: dto.activityDomain,
      mission: dto.mission,
      visibility: dto.visibility as ZumaraVisibility | undefined,
    });

    await this.audit.createEvent({
      actorId,
      action: 'ZUMARA_CREATED',
      targetType: 'Zumara',
      targetId: zumara.id,
      organizationUnitId: unitId,
      newValue: { unitId, activityDomain: dto.activityDomain },
    });

    return zumara;
  }

  async updateZumara(id: string, dto: CreateZumaraDto, actorId: string) {
    const existing = await this.repo.findZumaraById(id);
    if (!existing) throw new NotFoundException('Zumara introuvable');

    const updated = await this.repo.updateZumara(id, {
      activityDomain: dto.activityDomain,
      mission: dto.mission,
      visibility: dto.visibility as ZumaraVisibility | undefined,
    });

    await this.audit.createEvent({
      actorId,
      action: 'ZUMARA_UPDATED',
      targetType: 'Zumara',
      targetId: id,
      oldValue: { activityDomain: existing.activityDomain, mission: existing.mission },
      newValue: dto,
    });

    return updated;
  }
}
