import { PrismaClient, PermissionAction, RoleScope, IdentityType, IdentityStatus, AccountStatus, ProfileVisibility, ArticleStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GAMAD HUB 2.0...');

  // ─── 1. PERMISSIONS ────────────────────────────────────────────────────────

  const permissionDefs = [
    // identity
    { code: 'identity.read', module: 'identity', action: PermissionAction.READ, description: 'Lire les identités' },
    { code: 'identity.create', module: 'identity', action: PermissionAction.CREATE, description: 'Créer une identité' },
    { code: 'identity.update', module: 'identity', action: PermissionAction.UPDATE, description: 'Modifier une identité' },
    { code: 'identity.delete', module: 'identity', action: PermissionAction.DELETE, description: 'Supprimer une identité' },
    { code: 'identity.manage', module: 'identity', action: PermissionAction.MANAGE, description: 'Gérer les identités' },
    { code: 'identity.export', module: 'identity', action: PermissionAction.EXPORT, description: 'Exporter les identités' },
    // organization
    { code: 'organization.read', module: 'organization', action: PermissionAction.READ, description: 'Lire les structures' },
    { code: 'organization.create', module: 'organization', action: PermissionAction.CREATE, description: 'Créer une structure' },
    { code: 'organization.update', module: 'organization', action: PermissionAction.UPDATE, description: 'Modifier une structure' },
    { code: 'organization.manage', module: 'organization', action: PermissionAction.MANAGE, description: 'Gérer les structures' },
    { code: 'organization.archive', module: 'organization', action: PermissionAction.ARCHIVE, description: 'Archiver une structure' },
    { code: 'organization.assign', module: 'organization', action: PermissionAction.ASSIGN, description: 'Affecter un membre' },
    // formation
    { code: 'formation.read', module: 'formation', action: PermissionAction.READ, description: 'Lire les formations' },
    { code: 'formation.create', module: 'formation', action: PermissionAction.CREATE, description: 'Créer une formation' },
    { code: 'formation.update', module: 'formation', action: PermissionAction.UPDATE, description: 'Modifier une formation' },
    { code: 'formation.manage', module: 'formation', action: PermissionAction.MANAGE, description: 'Gérer les formations' },
    // communication
    { code: 'communication.read', module: 'communication', action: PermissionAction.READ, description: 'Lire les communications' },
    { code: 'communication.create', module: 'communication', action: PermissionAction.CREATE, description: 'Créer une communication' },
    { code: 'communication.moderate', module: 'communication', action: PermissionAction.MODERATE, description: 'Modérer les communications' },
    { code: 'communication.manage', module: 'communication', action: PermissionAction.MANAGE, description: 'Gérer les communications' },
    // activity
    { code: 'activity.read', module: 'activity', action: PermissionAction.READ, description: 'Lire les activités' },
    { code: 'activity.create', module: 'activity', action: PermissionAction.CREATE, description: 'Créer une activité' },
    { code: 'activity.update', module: 'activity', action: PermissionAction.UPDATE, description: 'Modifier une activité' },
    { code: 'activity.validate', module: 'activity', action: PermissionAction.VALIDATE, description: 'Valider une activité' },
    { code: 'activity.manage', module: 'activity', action: PermissionAction.MANAGE, description: 'Gérer les activités' },
    { code: 'activity.archive', module: 'activity', action: PermissionAction.ARCHIVE, description: 'Archiver une activité' },
    // knowledge
    { code: 'knowledge.read', module: 'knowledge', action: PermissionAction.READ, description: 'Lire les documents' },
    { code: 'knowledge.create', module: 'knowledge', action: PermissionAction.CREATE, description: 'Créer un document' },
    { code: 'knowledge.update', module: 'knowledge', action: PermissionAction.UPDATE, description: 'Modifier un document' },
    { code: 'knowledge.validate', module: 'knowledge', action: PermissionAction.VALIDATE, description: 'Valider un document' },
    { code: 'knowledge.manage', module: 'knowledge', action: PermissionAction.MANAGE, description: 'Gérer les documents' },
    { code: 'knowledge.export', module: 'knowledge', action: PermissionAction.EXPORT, description: 'Exporter un document' },
    { code: 'knowledge.archive', module: 'knowledge', action: PermissionAction.ARCHIVE, description: 'Archiver un document' },
    // cotisation
    { code: 'cotisation.read', module: 'cotisation', action: PermissionAction.READ, description: 'Lire les cotisations' },
    { code: 'cotisation.manage', module: 'cotisation', action: PermissionAction.MANAGE, description: 'Gérer les cotisations' },
    // audit
    { code: 'audit.read', module: 'audit', action: PermissionAction.READ, description: 'Lire les audits' },
    { code: 'audit.export', module: 'audit', action: PermissionAction.EXPORT, description: 'Exporter les audits' },
    // permissions
    { code: 'permissions.read', module: 'permissions', action: PermissionAction.READ, description: 'Lire les permissions' },
    { code: 'permissions.manage', module: 'permissions', action: PermissionAction.MANAGE, description: 'Gérer les permissions' },
    { code: 'permissions.assign', module: 'permissions', action: PermissionAction.ASSIGN, description: 'Attribuer des rôles' },
    { code: 'permissions.revoke', module: 'permissions', action: PermissionAction.REVOKE, description: 'Révoquer des rôles' },
  ];

  const permissions: Record<string, { id: string }> = {};
  for (const def of permissionDefs) {
    const p = await prisma.permission.upsert({
      where: { code: def.code },
      update: {},
      create: def,
    });
    permissions[def.code] = p;
  }
  console.log(`✓ ${permissionDefs.length} permissions créées`);

  // ─── 2. RÔLES ──────────────────────────────────────────────────────────────

  const roleDefs = [
    {
      name: 'SUPER_ADMINISTRATOR',
      scope: RoleScope.GLOBAL,
      description: 'Administrateur souverain — accès total au système',
      isSystemRole: true,
      permissionCodes: permissionDefs.map(p => p.code),
    },
    {
      name: 'RESPONSABLE_HCG',
      scope: RoleScope.GLOBAL,
      description: 'Membre de la Haute Coordination de Gouvernance',
      isSystemRole: true,
      permissionCodes: [
        'identity.read', 'identity.manage', 'identity.export',
        'organization.read', 'organization.create', 'organization.update', 'organization.manage', 'organization.archive', 'organization.assign',
        'formation.read', 'formation.manage',
        'communication.read', 'communication.create', 'communication.moderate', 'communication.manage',
        'activity.read', 'activity.create', 'activity.validate', 'activity.manage', 'activity.archive',
        'knowledge.read', 'knowledge.validate', 'knowledge.manage', 'knowledge.export', 'knowledge.archive',
        'cotisation.read', 'cotisation.manage',
        'audit.read', 'audit.export',
        'permissions.read', 'permissions.assign', 'permissions.revoke',
      ],
    },
    {
      name: 'RESPONSABLE_DEPT',
      scope: RoleScope.UNIT,
      description: 'Responsable de département',
      isSystemRole: false,
      permissionCodes: [
        'identity.read', 'organization.read', 'organization.update', 'organization.assign',
        'formation.read', 'formation.create',
        'communication.read', 'communication.create', 'communication.moderate',
        'activity.read', 'activity.create', 'activity.validate', 'activity.archive',
        'knowledge.read', 'knowledge.create', 'knowledge.validate', 'knowledge.archive',
        'cotisation.read',
        'audit.read',
        'permissions.read',
      ],
    },
    {
      name: 'RESPONSABLE_ZUMARA',
      scope: RoleScope.UNIT,
      description: 'Responsable de cellule Zumara',
      isSystemRole: false,
      permissionCodes: [
        'identity.read', 'organization.read', 'organization.assign',
        'formation.read',
        'communication.read', 'communication.create',
        'activity.read', 'activity.create', 'activity.update',
        'knowledge.read', 'knowledge.create',
        'cotisation.read',
      ],
    },
    {
      name: 'CITOYEN_ACTIVE',
      scope: RoleScope.UNIT,
      description: 'Citoyen GAMAD actif — accès citoyen complet',
      isSystemRole: false,
      permissionCodes: [
        'identity.read',
        'organization.read',
        'formation.read',
        'communication.read', 'communication.create',
        'activity.read', 'activity.create',
        'knowledge.read',
        'cotisation.read',
      ],
    },
    {
      name: 'CANDIDAT',
      scope: RoleScope.GLOBAL,
      description: 'Candidat en attente de validation',
      isSystemRole: false,
      permissionCodes: [
        'identity.read',
        'formation.read',
      ],
    },
  ];

  const roles: Record<string, { id: string }> = {};
  for (const def of roleDefs) {
    const role = await prisma.role.upsert({
      where: { name: def.name },
      update: {},
      create: {
        name: def.name,
        scope: def.scope,
        description: def.description,
        isSystemRole: def.isSystemRole,
      },
    });
    roles[def.name] = role;

    // Assign permissions to role
    for (const code of def.permissionCodes) {
      const perm = permissions[code];
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }
  console.log(`✓ ${roleDefs.length} rôles créés avec leurs permissions`);

  // ─── 3. COMPTE ADMIN ───────────────────────────────────────────────────────

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@gamad.net';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@GAMAD2026!';
  const adminDisplayName = process.env.ADMIN_DISPLAY_NAME ?? 'Administrateur GAMAD';

  const existingAdmin = await prisma.account.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const gamadId = await prisma.gamadId.create({
      data: {
        publicCode: 'GMD-000001',
        identityType: IdentityType.PERSON,
        status: IdentityStatus.ACTIVE,
      },
    });

    await prisma.account.create({
      data: {
        gamadId: gamadId.id,
        email: adminEmail,
        passwordHash,
        status: AccountStatus.ACTIVE,
      },
    });

    await prisma.profile.create({
      data: {
        gamadId: gamadId.id,
        displayName: adminDisplayName,
        visibility: ProfileVisibility.PRIVATE,
      },
    });

    const superAdminRole = roles['SUPER_ADMINISTRATOR'];
    if (superAdminRole) {
      await prisma.memberRole.create({
        data: {
          gamadId: gamadId.id,
          roleId: superAdminRole.id,
          grantedAt: new Date(),
        },
      });
    }

    await prisma.auditEvent.create({
      data: {
        actorId: gamadId.id,
        action: 'ADMIN_ACCOUNT_SEEDED',
        targetType: 'GamadId',
        targetId: gamadId.id,
        newValue: { email: adminEmail, displayName: adminDisplayName },
      },
    });

    console.log(`✓ Compte admin créé : ${adminEmail}`);
  } else {
    console.log(`ℹ Compte admin déjà existant : ${adminEmail}`);
  }

  // ─── 4. CATÉGORIES D'ARTICLES ──────────────────────────────────────────────

  const categories = [
    { name: 'Actualités', slug: 'actualites' },
    { name: 'Technologie', slug: 'technologie' },
  ];

  for (const cat of categories) {
    await prisma.articleCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✓ ${categories.length} catégories d'articles créées`);

  // ─── 5. ARTICLE DE TEST ────────────────────────────────────────────────────

  const actualitesCategory = await prisma.articleCategory.findUnique({ where: { slug: 'actualites' } });

  await prisma.article.upsert({
    where: { slug: 'bienvenue-sur-gamad' },
    update: {},
    create: {
      title: 'Bienvenue sur GAMAD',
      slug: 'bienvenue-sur-gamad',
      excerpt: 'Découvrez GAMAD, une infrastructure de transmission, de formation et de gouvernance numérique.',
      content: 'GAMAD est une infrastructure civilisationnelle numérique conçue pour transmettre la connaissance, coordonner les actions et gouverner les structures avec rigueur et traçabilité.',
      categoryId: actualitesCategory?.id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });
  console.log('✓ Article de test créé');

  console.log('\n✅ Seed GAMAD HUB 2.0 terminé.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
