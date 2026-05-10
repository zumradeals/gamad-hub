import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { PermissionCheckDto } from "./dto/permission-check.dto";
import { blockedIdentityStatuses, classificationRank } from "./policies/permission.policy";

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async assertPermission(input: PermissionCheckDto) {
    if (!input.actorId) {
      throw new UnauthorizedException("Authentication required");
    }

    const allowed = await this.hasPermission(input);
    if (!allowed) {
      await this.auditPermissionDenied(input.actorId, input.permissionCode, input.organizationUnitId);
      throw new ForbiddenException(`Missing permission: ${input.permissionCode}`);
    }
  }

  async hasPermission(input: PermissionCheckDto) {
    const actor = await this.prisma.gamadId.findUnique({
      where: { id: input.actorId },
      select: { id: true, status: true }
    });

    if (!actor || blockedIdentityStatuses.includes(actor.status as never)) {
      return false;
    }

    if (input.resourceClassification && !this.isClassificationAllowed(input.permissionCode, input.resourceClassification)) {
      return false;
    }

    const roleAssignment = await this.prisma.memberRole.findFirst({
      where: {
        gamadId: input.actorId,
        revokedAt: null,
        role: {
          rolePermissions: {
            some: {
              permission: {
                code: input.permissionCode
              }
            }
          }
        },
        OR: [
          { organizationUnitId: null },
          ...(input.organizationUnitId ? [{ organizationUnitId: input.organizationUnitId }] : [])
        ]
      },
      select: {
        id: true
      }
    });

    return Boolean(roleAssignment);
  }

  async auditPermissionDenied(actorId: string, permissionCode: string, organizationUnitId?: string) {
    await this.prisma.auditEvent.create({
      data: {
        actorId,
        action: "PERMISSION_DENIED",
        targetType: "PERMISSION",
        organizationUnitId,
        newValue: {
          permissionCode,
          organizationUnitId
        }
      }
    });
  }

  isClassificationAllowed(permissionCode: string, classification: keyof typeof classificationRank) {
    if (classificationRank[classification] <= classificationRank.INTERNAL) {
      return true;
    }

    if (classification === "CONFIDENTIAL") {
      return permissionCode.endsWith(".read_confidential") || permissionCode.endsWith(".manage") || permissionCode === "document.read";
    }

    if (classification === "STRATEGIC" || classification === "RESTRICTED") {
      return permissionCode.endsWith(".read_strategic") || permissionCode.endsWith(".manage");
    }

    return false;
  }
}
