#!/usr/bin/env node
// Creates the initial super-admin account from env vars ADMIN_EMAIL / ADMIN_PASSWORD.
// Idempotent: skips if the account already exists.
'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email       = process.env.ADMIN_EMAIL;
  const password    = process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_DISPLAY_NAME || 'Super Admin GAMAD';

  if (!email || !password) {
    console.log('[seed-admin] ADMIN_EMAIL ou ADMIN_PASSWORD non défini — ignoré');
    return;
  }

  const existing = await prisma.account.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed-admin] Compte ${email} déjà existant — ignoré`);
    return;
  }

  const total      = await prisma.gamadId.count();
  const publicCode = `GMD-${String(total + 1).padStart(6, '0')}`;
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

  // Assign HCG role if it exists
  const hcgRole = await prisma.role.findFirst({ where: { name: 'HCG' } });
  if (hcgRole) {
    await prisma.memberRole.create({
      data: { gamadId: gamadId.id, roleId: hcgRole.id, grantedBy: gamadId.id },
    });
    console.log(`[seed-admin] Compte admin créé : ${email} (${publicCode}) — rôle HCG assigné`);
  } else {
    console.log(`[seed-admin] Compte admin créé : ${email} (${publicCode})`);
  }
}

main()
  .catch(e => { console.error('[seed-admin] Erreur :', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
