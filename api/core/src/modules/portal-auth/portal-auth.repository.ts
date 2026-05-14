import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ApplicationStatus, IdentityStatus, IdentityType, AccountStatus, ProfileVisibility } from '@prisma/client';


@Injectable()
export class PortalAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  generatePublicCode(): string {
    const raw = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
    return `GMID-${raw}`;
  }

  async createPortalUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    country?: string;
    city?: string;
  }) {
    const publicCode = this.generatePublicCode();
    return this.prisma.gamadId.create({
      data: {
        publicCode,
        identityType: IdentityType.PERSON,
        status: IdentityStatus.PORTAL_USER,
        account: {
          create: {
            email: data.email,
            passwordHash: data.passwordHash,
            status: AccountStatus.ACTIVE,
          },
        },
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            displayName: `${data.firstName} ${data.lastName}`.trim(),
            country: data.country,
            city: data.city,
            visibility: ProfileVisibility.PUBLIC,
          },
        },
      },
      include: { profile: true, account: { select: { id: true, email: true } } },
    });
  }

  findAccountByEmail(email: string) {
    return this.prisma.account.findUnique({
      where: { email },
      include: {
        gamad: { include: { profile: true } },
      },
    });
  }

  findById(id: string) {
    return this.prisma.gamadId.findUnique({
      where: { id },
      include: { profile: true, account: { select: { id: true, email: true, createdAt: true } } },
    });
  }

  async updateLastLogin(gamadId: string) {
    return this.prisma.account.update({
      where: { gamadId },
      data: { lastLoginAt: new Date() },
    });
  }

  async createApplication(data: {
    gamadId: string;
    email: string;
    firstName: string;
    lastName: string;
    country?: string;
    city?: string;
    message?: string;
  }) {
    return this.prisma.portalApplication.create({
      data: {
        gamadId: data.gamadId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
        city: data.city,
        message: data.message,
        status: ApplicationStatus.SUBMITTED,
      },
    });
  }

  findApplicationByGamadId(gamadId: string) {
    return this.prisma.portalApplication.findFirst({
      where: { gamadId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
