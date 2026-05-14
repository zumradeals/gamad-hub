#!/usr/bin/env node
// Creates the initial super-admin account from env vars ADMIN_EMAIL / ADMIN_PASSWORD.
// Idempotent: if the account already exists, ensures the RESPONSABLE_HCG role is assigned.
'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Role name expected by computeLevel() in auth.service.ts
const HCG_ROLE_NAME = 'RESPONSABLE_HCG';

async function ensureHcgRole() {
  return prisma.role.upsert({
    where: { name: HCG_ROLE_NAME },
    create: {
      name: HCG_ROLE_NAME,
      description: 'Haut Conseil de Gouvernance — autorité souveraine',
      isSystemRole: true,
    },
    update: {},
  });
}

async function assignRole(gamadIdValue, roleId, grantedBy) {
  const existing = await prisma.memberRole.findFirst({
    where: { gamadId: gamadIdValue, roleId },
  });
  if (!existing) {
    await prisma.memberRole.create({
      data: { gamadId: gamadIdValue, roleId, grantedBy },
    });
  }
}

async function main() {
  const email       = process.env.ADMIN_EMAIL;
  const password    = process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_DISPLAY_NAME || 'Super Admin GAMAD';

  if (!email || !password) {
    console.log('[seed-admin] ADMIN_EMAIL ou ADMIN_PASSWORD non défini — ignoré');
    return;
  }

  const hcgRole = await ensureHcgRole();

  const existing = await prisma.account.findUnique({
    where: { email },
    include: { gamad: { include: { memberRoles: true } } },
  });

  if (existing) {
    // Account exists — ensure HCG role is assigned (idempotent upgrade)
    await assignRole(existing.gamad.id, hcgRole.id, existing.gamad.id);
    console.log(`[seed-admin] Compte ${email} existant — rôle ${HCG_ROLE_NAME} vérifié/assigné`);
    return;
  }

  const total        = await prisma.gamadId.count();
  const publicCode   = `GMD-${String(total + 1).padStart(6, '0')}`;
  const passwordHash = await bcrypt.hash(password, 12);

  const gamadId = await prisma.gamadId.create({
    data: {
      publicCode,
      identityType: 'PERSON',
      status: 'ACTIVE',
      account: {
        create: { email, passwordHash, status: 'ACTIVE' },
      },
      profile: {
        create: { displayName, visibility: 'PRIVATE' },
      },
    },
  });

  await assignRole(gamadId.id, hcgRole.id, gamadId.id);

  console.log(`[seed-admin] Compte admin créé : ${email} (${publicCode}) — rôle ${HCG_ROLE_NAME} assigné`);
}

main()
  .catch(e => { console.error('[seed-admin] Erreur :', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
