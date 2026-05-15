-- AlterEnum: IdentityStatus
ALTER TYPE "IdentityStatus" ADD VALUE IF NOT EXISTS 'MISSIONARY';
ALTER TYPE "IdentityStatus" ADD VALUE IF NOT EXISTS 'ILLUMINATED';

-- AlterEnum: ZumaraVisibility
ALTER TYPE "ZumaraVisibility" ADD VALUE IF NOT EXISTS 'CORE';

-- CreateEnum: ZumaraType
DO $$ BEGIN
  CREATE TYPE "ZumaraType" AS ENUM ('LOCAL', 'DIGITAL', 'HYBRID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum: ZumaraRequestStatus
DO $$ BEGIN
  CREATE TYPE "ZumaraRequestStatus" AS ENUM ('SUBMITTED', 'PRE_VALIDATED', 'IN_FORMATION', 'ACTIVE', 'REJECTED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum: ZumaraStatus
DO $$ BEGIN
  CREATE TYPE "ZumaraStatus" AS ENUM ('ACTIVE', 'ESTABLISHED', 'SATELLITE', 'ELITE', 'SUSPENDED', 'DISSOLVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum: ZumaraMemberRole
DO $$ BEGIN
  CREATE TYPE "ZumaraMemberRole" AS ENUM ('FOUNDER', 'CO_FOUNDER', 'MEMBER', 'OBSERVER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum: RevelationPath
DO $$ BEGIN
  CREATE TYPE "RevelationPath" AS ENUM ('DIRECT', 'THRESHOLD', 'SPONSORED', 'CHOSEN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable: ZumaraRequest
CREATE TABLE "ZumaraRequest" (
  "id"          TEXT NOT NULL,
  "gamadId"     TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "objective"   TEXT NOT NULL,
  "type"        "ZumaraType" NOT NULL DEFAULT 'HYBRID',
  "country"     TEXT,
  "city"        TEXT,
  "status"      "ZumaraRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
  "reviewNote"  TEXT,
  "reviewedBy"  TEXT,
  "reviewedAt"  TIMESTAMP(3),
  "deadline"    TIMESTAMP(3),
  "activatedAt" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ZumaraRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ZumaraFounder
CREATE TABLE "ZumaraFounder" (
  "id"        TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "gamadId"   TEXT,
  "email"     TEXT NOT NULL,
  "role"      "ZumaraMemberRole" NOT NULL DEFAULT 'CO_FOUNDER',
  "trained"   BOOLEAN NOT NULL DEFAULT false,
  "joinedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ZumaraFounder_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ZumaraCell
CREATE TABLE "ZumaraCell" (
  "id"               TEXT NOT NULL,
  "requestId"        TEXT NOT NULL,
  "name"             TEXT NOT NULL,
  "slug"             TEXT NOT NULL,
  "objective"        TEXT NOT NULL,
  "type"             "ZumaraType" NOT NULL,
  "country"          TEXT,
  "city"             TEXT,
  "status"           "ZumaraStatus" NOT NULL DEFAULT 'ACTIVE',
  "visibility"       "ZumaraVisibility" NOT NULL DEFAULT 'PUBLIC',
  "memberCount"      INTEGER NOT NULL DEFAULT 5,
  "cotisationAmount" DOUBLE PRECISION,
  "cotisationPeriod" TEXT,
  "walletBalance"    DOUBLE PRECISION NOT NULL DEFAULT 0,
  "activatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ZumaraCell_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ZumaraCellMembership
CREATE TABLE "ZumaraCellMembership" (
  "id"       TEXT NOT NULL,
  "cellId"   TEXT NOT NULL,
  "gamadId"  TEXT NOT NULL,
  "role"     "ZumaraMemberRole" NOT NULL DEFAULT 'MEMBER',
  "status"   "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leftAt"   TIMESTAMP(3),
  CONSTRAINT "ZumaraCellMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable: RevelationEvent
CREATE TABLE "RevelationEvent" (
  "id"        TEXT NOT NULL,
  "gamadId"   TEXT NOT NULL,
  "path"      "RevelationPath" NOT NULL,
  "actorId"   TEXT,
  "note"      TEXT,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RevelationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZumaraCell_requestId_key" ON "ZumaraCell"("requestId");
CREATE UNIQUE INDEX "ZumaraCell_slug_key" ON "ZumaraCell"("slug");
CREATE UNIQUE INDEX "ZumaraFounder_requestId_email_key" ON "ZumaraFounder"("requestId", "email");
CREATE UNIQUE INDEX "ZumaraCellMembership_cellId_gamadId_key" ON "ZumaraCellMembership"("cellId", "gamadId");

-- AddForeignKey
ALTER TABLE "ZumaraRequest" ADD CONSTRAINT "ZumaraRequest_gamadId_fkey" FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ZumaraFounder" ADD CONSTRAINT "ZumaraFounder_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ZumaraRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ZumaraFounder" ADD CONSTRAINT "ZumaraFounder_gamadId_fkey" FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ZumaraCell" ADD CONSTRAINT "ZumaraCell_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ZumaraRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ZumaraCellMembership" ADD CONSTRAINT "ZumaraCellMembership_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "ZumaraCell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ZumaraCellMembership" ADD CONSTRAINT "ZumaraCellMembership_gamadId_fkey" FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RevelationEvent" ADD CONSTRAINT "RevelationEvent_gamadId_fkey" FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
