import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { IdentityStatus, IdentityType, AccountStatus, ProfileVisibility } from '@prisma/client';

const GAMAD_ID_INCLUDE = {
  profile: true,
  account: {
    select: {
      id: true,
      email: true,
      phone: true,
      mfaEnabled: true,
      lastLoginAt: true,
      status: true,
      createdAt: true,
    },
  },
  memberships: {
    include: { organizationUnit: true },
  },
  memberRoles: {
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
    where: { revokedAt: null },
  },
};

@Injectable()
export class IdentityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts: { skip?: number; take?: number; status?: string; search?: string }) {
    const where: any = {};
    if (opts.status) where.status = opts.status as IdentityStatus;
    if (opts.search) {
      where.OR = [
        { publicCode: { contains: opts.search, mode: 'insensitive' } },
        { profile: { displayName: { contains: opts.search, mode: 'insensitive' } } },
        { account: { email: { contains: opts.search, mode: 'insensitive' } } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.gamadId.findMany({
        where,
        skip: opts.skip ?? 0,
        take: opts.take ?? 20,
        include: GAMAD_ID_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.gamadId.count({ where }),
    ]);
    return { items, total, skip: opts.skip ?? 0, take: opts.take ?? 20 };
  }

  findById(id: string) {
    return this.prisma.gamadId.findUnique({ where: { id }, include: GAMAD_ID_INCLUDE });
  }

  findByPublicCode(publicCode: string) {
    return this.prisma.gamadId.findUnique({ where: { publicCode }, include: GAMAD_ID_INCLUDE });
  }

  async countAll() {
    return this.prisma.gamadId.count();
  }

  async create(data: {
    publicCode: string;
    identityType: IdentityType;
    displayName: string;
    email: string;
    phone?: string;
    passwordHash: string;
  }) {
    return this.prisma.gamadId.create({
      data: {
        publicCode: data.publicCode,
        identityType: data.identityType,
        status: IdentityStatus.PENDING,
        account: {
          create: {
            email: data.email,
            phone: data.phone,
            passwordHash: data.passwordHash,
            status: AccountStatus.ACTIVE,
          },
        },
        profile: {
          create: {
            displayName: data.displayName,
            visibility: ProfileVisibility.INTERNAL,
          },
        },
      },
      include: GAMAD_ID_INCLUDE,
    });
  }

  async updateStatus(id: string, status: IdentityStatus) {
    return this.prisma.gamadId.update({ where: { id }, data: { status } });
  }

  async updateLastLogin(gamadId: string) {
    return this.prisma.account.update({
      where: { gamadId },
      data: { lastLoginAt: new Date() },
    });
  }

  findAccountByEmail(email: string) {
    return this.prisma.account.findUnique({
      where: { email },
      include: {
        gamad: {
          include: {
            profile: true,
            memberships: { include: { organizationUnit: true } },
            memberRoles: {
              where: { revokedAt: null },
              include: { role: true },
            },
          },
        },
      },
    });
  }

  findProfile(gamadId: string) {
    return this.prisma.profile.findUnique({ where: { gamadId } });
  }

  async updateProfile(gamadId: string, data: Partial<{
    firstName: string;
    lastName: string;
    displayName: string;
    bio: string;
    country: string;
    city: string;
    visibility: ProfileVisibility;
  }>) {
    return this.prisma.profile.update({ where: { gamadId }, data });
  }
}
