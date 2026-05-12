import { Injectable } from "@nestjs/common";
import { IdentityStatus, IdentityType } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class IdentityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async nextPublicCode() {
    const count = await this.prisma.gamadId.count();
    return `GMD-${String(count + 1).padStart(6, "0")}`;
  }

  createIdentity(input: {
    publicCode: string;
    identityType: IdentityType;
    email: string;
    phone?: string;
    passwordHash: string;
    displayName: string;
  }) {
    return this.prisma.gamadId.create({
      data: {
        publicCode: input.publicCode,
        identityType: input.identityType,
        status: IdentityStatus.PENDING,
        accounts: {
          create: {
            email: input.email,
            phone: input.phone,
            passwordHash: input.passwordHash
          }
        },
        profile: {
          create: {
            displayName: input.displayName,
            visibility: "INTERNAL"
          }
        }
      },
      include: {
        accounts: true,
        profile: true
      }
    });
  }

  findIdentity(id: string) {
    return this.prisma.gamadId.findUnique({
      where: { id },
      include: {
        accounts: { select: { id: true, email: true, phone: true, status: true, mfaEnabled: true, lastLoginAt: true } },
        profile: true,
        memberRoles: { include: { role: true, organizationUnit: true } },
        memberships: { include: { organizationUnit: true } }
      }
    });
  }

  findAccountByEmail(email: string) {
    return this.prisma.account.findUnique({
      where: { email },
      include: {
        gamadIdentity: {
          include: {
            profile: true
          }
        }
      }
    });
  }

  updateIdentityStatus(id: string, status: IdentityStatus) {
    return this.prisma.gamadId.update({
      where: { id },
      data: { status }
    });
  }

  updateLastLogin(accountId: string) {
    return this.prisma.account.update({
      where: { id: accountId },
      data: { lastLoginAt: new Date() }
    });
  }

  updateProfile(gamadId: string, data: { displayName?: string; bio?: string; city?: string; country?: string }) {
    return this.prisma.profile.update({
      where: { gamadId },
      data
    });
  }

  findProfile(gamadId: string) {
    return this.prisma.profile.findUnique({
      where: { gamadId }
    });
  }

  async hasPermission(actorId: string, permissionCode: string) {
    const assignment = await this.prisma.memberRole.findFirst({
      where: {
        gamadId: actorId,
        revokedAt: null,
        role: {
          rolePermissions: {
            some: {
              permission: {
                code: permissionCode
              }
            }
          }
        }
      },
      include: {
        gamadIdentity: true
      }
    });

    return Boolean(
      assignment &&
        assignment.gamadIdentity.status === "ACTIVE"
    );
  }

  countGamadIds() {
    return this.prisma.gamadId.count();
  }

  listGamadIdsSummary(params: { skip: number; take: number }) {
    return this.prisma.gamadId.findMany({
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        publicCode: true,
        status: true,
        identityType: true,
        profile: { select: { displayName: true } },
        accounts: { select: { email: true }, take: 1 }
      }
    });
  }

  writeAudit(input: {
    actorId?: string;
    action: string;
    targetType: string;
    targetId?: string;
    oldValue?: unknown;
    newValue?: unknown;
  }) {
    return this.prisma.auditEvent.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        oldValue: input.oldValue === undefined ? undefined : JSON.parse(JSON.stringify(input.oldValue)),
        newValue: input.newValue === undefined ? undefined : JSON.parse(JSON.stringify(input.newValue))
      }
    });
  }
}
