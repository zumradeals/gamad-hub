-- CreateEnum: ModerationStatus
DO $$ BEGIN
  CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: ZahabTransactionReason
DO $$ BEGIN
  CREATE TYPE "ZahabTransactionReason" AS ENUM (
    'CONTENT_PUBLISHED', 'CONTENT_REWARD', 'COMMENT_REWARD',
    'REACTION_RECEIVED', 'REFERRAL', 'COTISATION_PAYMENT',
    'REGISTRATION_BONUS', 'MANUAL_CREDIT', 'MANUAL_DEBIT', 'CONVERSION_REQUEST'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: TrustLevel
DO $$ BEGIN
  CREATE TYPE "TrustLevel" AS ENUM ('NEWCOMER', 'MEMBER', 'TRUSTED', 'VETERAN', 'GUARDIAN');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AlterTable: PortalFeedPost — add new columns
ALTER TABLE "PortalFeedPost"
  ADD COLUMN IF NOT EXISTS "contentBlocks"    JSONB,
  ADD COLUMN IF NOT EXISTS "mediaUrls"        JSONB,
  ADD COLUMN IF NOT EXISTS "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN IF NOT EXISTS "zahabRewarded"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "rewardAmount"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "viewCount"        INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Article — add new columns
ALTER TABLE "Article"
  ADD COLUMN IF NOT EXISTS "contentBlocks"    JSONB,
  ADD COLUMN IF NOT EXISTS "authorId"         TEXT,
  ADD COLUMN IF NOT EXISTS "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "zahabRewarded"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "rewardAmount"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "viewCount"        INTEGER NOT NULL DEFAULT 0;

-- CreateTable: ZahabWallet
CREATE TABLE IF NOT EXISTS "ZahabWallet" (
  "id"           TEXT NOT NULL,
  "gamadId"      TEXT NOT NULL,
  "balance"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  "lockedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalEarned"  DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalSpent"   DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ZahabWallet_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ZahabWallet_gamadId_key" ON "ZahabWallet"("gamadId");

-- CreateTable: ZahabTransaction
CREATE TABLE IF NOT EXISTS "ZahabTransaction" (
  "id"          TEXT NOT NULL,
  "fromId"      TEXT,
  "toId"        TEXT NOT NULL,
  "amount"      DOUBLE PRECISION NOT NULL,
  "reason"      "ZahabTransactionReason" NOT NULL,
  "referenceId" TEXT,
  "note"        TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ZahabTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ReputationScore
CREATE TABLE IF NOT EXISTS "ReputationScore" (
  "id"              TEXT NOT NULL,
  "gamadId"         TEXT NOT NULL,
  "score"           INTEGER NOT NULL DEFAULT 0,
  "contentScore"    INTEGER NOT NULL DEFAULT 0,
  "engagementScore" INTEGER NOT NULL DEFAULT 0,
  "trustLevel"      "TrustLevel" NOT NULL DEFAULT 'NEWCOMER',
  "totalPosts"      INTEGER NOT NULL DEFAULT 0,
  "totalComments"   INTEGER NOT NULL DEFAULT 0,
  "totalReactions"  INTEGER NOT NULL DEFAULT 0,
  "totalReported"   INTEGER NOT NULL DEFAULT 0,
  "totalFlagged"    INTEGER NOT NULL DEFAULT 0,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReputationScore_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ReputationScore_gamadId_key" ON "ReputationScore"("gamadId");

-- AddForeignKey
ALTER TABLE "ZahabWallet" ADD CONSTRAINT "ZahabWallet_gamadId_fkey"
  FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ZahabTransaction" ADD CONSTRAINT "ZahabTransaction_fromId_fkey"
  FOREIGN KEY ("fromId") REFERENCES "GamadId"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ZahabTransaction" ADD CONSTRAINT "ZahabTransaction_toId_fkey"
  FOREIGN KEY ("toId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ReputationScore" ADD CONSTRAINT "ReputationScore_gamadId_fkey"
  FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
