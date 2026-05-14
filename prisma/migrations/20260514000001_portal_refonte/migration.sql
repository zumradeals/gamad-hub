-- AlterEnum: add PORTAL_USER to IdentityStatus
ALTER TYPE "IdentityStatus" ADD VALUE IF NOT EXISTS 'PORTAL_USER';

-- CreateEnum: ApplicationStatus
DO $$ BEGIN
  CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: FeedPostStatus
DO $$ BEGIN
  CREATE TYPE "FeedPostStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'DELETED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateTable: PortalApplication
CREATE TABLE IF NOT EXISTS "PortalApplication" (
    "id"                  TEXT NOT NULL,
    "gamadId"             TEXT,
    "firstName"           TEXT NOT NULL,
    "lastName"            TEXT NOT NULL,
    "email"               TEXT NOT NULL,
    "country"             TEXT,
    "city"                TEXT,
    "message"             TEXT,
    "status"              "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewNote"          TEXT,
    "reviewedAt"          TIMESTAMP(3),
    "advancedFormSentAt"  TIMESTAMP(3),
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PortalFeedPost
CREATE TABLE IF NOT EXISTS "PortalFeedPost" (
    "id"        TEXT NOT NULL,
    "gamadId"   TEXT NOT NULL,
    "content"   TEXT NOT NULL,
    "imageUrl"  TEXT,
    "status"    "FeedPostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalFeedPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PortalFeedReaction
CREATE TABLE IF NOT EXISTS "PortalFeedReaction" (
    "id"        TEXT NOT NULL,
    "postId"    TEXT NOT NULL,
    "gamadId"   TEXT NOT NULL,
    "emoji"     TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalFeedReaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PortalApplication" ADD CONSTRAINT "PortalApplication_gamadId_fkey"
  FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PortalFeedPost" ADD CONSTRAINT "PortalFeedPost_gamadId_fkey"
  FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PortalFeedReaction" ADD CONSTRAINT "PortalFeedReaction_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "PortalFeedPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PortalFeedReaction" ADD CONSTRAINT "PortalFeedReaction_gamadId_fkey"
  FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- UniqueConstraint
ALTER TABLE "PortalFeedReaction" DROP CONSTRAINT IF EXISTS "PortalFeedReaction_postId_gamadId_emoji_key";
ALTER TABLE "PortalFeedReaction" ADD CONSTRAINT "PortalFeedReaction_postId_gamadId_emoji_key"
  UNIQUE ("postId", "gamadId", "emoji");
