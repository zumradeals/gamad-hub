import { scryptSync, randomBytes } from "node:crypto";
import { PrismaClient, RoleScope } from "@prisma/client";

const prisma = new PrismaClient();

const permissionDefinitions = [
  ["identity.create", "identity", "create"],
  ["identity.read", "identity", "read"],
  ["identity.validate", "identity", "validate"],
  ["identity.suspend", "identity", "suspend"],
  ["identity.manage_roles", "identity", "manage_roles"],
  ["profile.read", "profile", "read"],
  ["profile.update.self", "profile", "update_self"],
  ["organization.create", "organization", "create"],
  ["organization.read", "organization", "read"],
  ["organization.update", "organization", "update"],
  ["organization.assign_member", "organization", "assign_member"],
  ["organization.archive", "organization", "archive"],
  ["activity.create", "activity", "create"],
  ["activity.read", "activity", "read"],
  ["activity.update", "activity", "update"],
  ["activity.validate", "activity", "validate"],
  ["activity.archive", "activity", "archive"],
  ["document.create", "document", "create"],
  ["document.read", "document", "read"],
  ["document.update", "document", "update"],
  ["document.validate", "document", "validate"],
  ["document.archive", "document", "archive"],
  ["document.export", "document", "export"],
  ["audit.read", "audit", "read"],
  ["audit.export", "audit", "export"],
  ["announcement.create", "announcement", "create"],
  ["announcement.publish", "announcement", "publish"],
  ["message.send", "message", "send"],
  ["notification.read", "notification", "read"]
] as const;

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

async function main() {
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMINISTRATOR" },
    update: {},
    create: {
      name: "SUPER_ADMINISTRATOR",
      scope: RoleScope.GLOBAL,
      description: "Administration centrale du systeme GAMAD HUB CORE.",
      isSystemRole: true
    }
  });

  await prisma.role.upsert({
    where: { name: "HCG_VALIDATOR" },
    update: {},
    create: {
      name: "HCG_VALIDATOR",
      scope: RoleScope.GLOBAL,
      description: "Validation de gouvernance centrale HCG.",
      isSystemRole: true
    }
  });

  for (const [code, module, action] of permissionDefinitions) {
    const permission = await prisma.permission.upsert({
      where: { code },
      update: { module, action },
      create: { code, module, action }
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id
      }
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminDisplayName = process.env.ADMIN_DISPLAY_NAME ?? "Super Admin GAMAD";

  if (adminEmail && adminPassword && adminPassword !== "change_me") {
    const adminIdentity = await prisma.gamadId.upsert({
      where: { publicCode: "GMD-DEV-ADMIN" },
      update: {},
      create: {
        publicCode: "GMD-DEV-ADMIN",
        identityType: "PERSON",
        status: "ACTIVE"
      }
    });

    await prisma.account.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        gamadId: adminIdentity.id,
        email: adminEmail,
        passwordHash: hashPassword(adminPassword),
        status: "ACTIVE"
      }
    });

    await prisma.profile.upsert({
      where: { gamadId: adminIdentity.id },
      update: { displayName: adminDisplayName },
      create: {
        gamadId: adminIdentity.id,
        displayName: adminDisplayName,
        visibility: "INTERNAL"
      }
    });

    await prisma.memberRole.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000001",
        gamadId: adminIdentity.id,
        roleId: superAdminRole.id,
        grantedBy: adminIdentity.id
      }
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
