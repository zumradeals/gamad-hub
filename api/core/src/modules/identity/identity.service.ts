import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IdentityRepository } from './identity.repository';
import { AuditService } from '../audit/audit.service';
import { CreateGamadIdDto } from './dto/create-gamad-id.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ValidateIdentityDto } from './dto/validate-identity.dto';
import { SuspendIdentityDto } from './dto/suspend-identity.dto';
import { IdentityStatus, IdentityType, ProfileVisibility } from '@prisma/client';

const SALT_ROUNDS = 12;

function generatePublicCode(total: number): string {
  const padded = String(total + 1).padStart(6, '0');
  return `GMD-${padded}`;
}

@Injectable()
export class IdentityService {
  constructor(
    private readonly repo: IdentityRepository,
    private readonly audit: AuditService,
  ) {}

  async findAll(opts: { skip?: number; take?: number; status?: string; search?: string }) {
    return this.repo.findAll(opts);
  }

  async findById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('GAMAD ID introuvable');
    return item;
  }

  async create(dto: CreateGamadIdDto, actorId?: string) {
    const existing = await this.repo.findAccountByEmail(dto.email);
    if (existing) throw new ConflictException('Email déjà utilisé');

    const total = await this.repo.countAll();
    const publicCode = generatePublicCode(total);
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const gamadId = await this.repo.create({
      publicCode,
      identityType: (dto.identityType as IdentityType) ?? IdentityType.PERSON,
      displayName: dto.displayName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
    });

    await this.audit.createEvent({
      actorId: actorId ?? gamadId.id,
      action: 'GAMAD_ID_CREATED',
      targetType: 'GamadId',
      targetId: gamadId.id,
      newValue: { publicCode, email: dto.email, displayName: dto.displayName },
    });

    return gamadId;
  }

  async validate(id: string, dto: ValidateIdentityDto, actorId: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('GAMAD ID introuvable');
    if (item.status !== IdentityStatus.PENDING) {
      throw new BadRequestException(`Impossible de valider un citoyen au statut ${item.status}`);
    }

    await this.repo.updateStatus(id, IdentityStatus.ACTIVE);

    await this.audit.createEvent({
      actorId,
      action: 'MEMBER_VALIDATED',
      targetType: 'GamadId',
      targetId: id,
      oldValue: { status: 'PENDING' },
      newValue: { status: 'ACTIVE', decisionNote: dto.decisionNote },
    });

    return { success: true, id, status: 'ACTIVE' };
  }

  async suspend(id: string, dto: SuspendIdentityDto, actorId: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('GAMAD ID introuvable');
    if (item.status === IdentityStatus.SUSPENDED) {
      throw new BadRequestException('Ce citoyen est déjà suspendu');
    }

    const previousStatus = item.status;
    await this.repo.updateStatus(id, IdentityStatus.SUSPENDED);

    await this.audit.createEvent({
      actorId,
      action: 'MEMBER_SUSPENDED',
      targetType: 'GamadId',
      targetId: id,
      oldValue: { status: previousStatus },
      newValue: { status: 'SUSPENDED', reason: dto.reason },
    });

    return { success: true, id, status: 'SUSPENDED' };
  }

  findProfile(gamadId: string) {
    return this.repo.findProfile(gamadId);
  }

  async updateProfile(gamadId: string, dto: UpdateProfileDto, actorId: string) {
    const profile = await this.repo.findProfile(gamadId);
    if (!profile) throw new NotFoundException('Profil introuvable');

    const updated = await this.repo.updateProfile(gamadId, {
      ...dto,
      visibility: dto.visibility as ProfileVisibility | undefined,
    });

    await this.audit.createEvent({
      actorId,
      action: 'PROFILE_UPDATED',
      targetType: 'Profile',
      targetId: profile.id,
      oldValue: {
        displayName: profile.displayName,
        bio: profile.bio,
        country: profile.country,
        city: profile.city,
      },
      newValue: dto,
    });

    return updated;
  }
}
