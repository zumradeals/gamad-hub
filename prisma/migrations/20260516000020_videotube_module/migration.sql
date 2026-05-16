-- Phase E0 — GamadTube module

-- Enum ZahabTransactionReason: add video values
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'VIDEO_WATCHED';
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'VIDEO_LIKED';
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'VIDEO_PUBLISHED';
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'VIDEO_MILESTONE_100';
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'VIDEO_MILESTONE_1K';
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'VIDEO_MILESTONE_10K';

-- Enum VideoStatus (already exists from previous migration if any, otherwise create)
DO $$ BEGIN
  CREATE TYPE "VideoStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- VideoChannel
CREATE TABLE IF NOT EXISTS "VideoChannel" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
  "slug"        TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "avatarUrl"   TEXT,
  "bannerUrl"   TEXT,
  "isOfficial"  BOOLEAN NOT NULL DEFAULT false,
  "gamadId"     TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VideoChannel_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VideoChannel_slug_key" ON "VideoChannel"("slug");
ALTER TABLE "VideoChannel" ADD CONSTRAINT IF NOT EXISTS "VideoChannel_gamadId_fkey"
  FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add tubeVideos relation column to VideoCategory (no column needed — FK is on GamadTubeVideo)

-- GamadTubeVideo
CREATE TABLE IF NOT EXISTS "GamadTubeVideo" (
  "id"               TEXT NOT NULL DEFAULT gen_random_uuid(),
  "slug"             TEXT NOT NULL,
  "title"            TEXT NOT NULL,
  "description"      TEXT,
  "youtubeUrl"       TEXT NOT NULL,
  "thumbnailUrl"     TEXT,
  "categoryId"       TEXT,
  "tags"             TEXT[] NOT NULL DEFAULT '{}',
  "durationMin"      INTEGER,
  "authorId"         TEXT,
  "channelId"        TEXT,
  "sponsored"        BOOLEAN NOT NULL DEFAULT false,
  "sponsorName"      TEXT,
  "sponsorUrl"       TEXT,
  "verified"         BOOLEAN NOT NULL DEFAULT false,
  "status"           "VideoStatus" NOT NULL DEFAULT 'DRAFT',
  "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
  "editorId"         TEXT,
  "rejectionNote"    TEXT,
  "viewCount"        INTEGER NOT NULL DEFAULT 0,
  "likesCount"       INTEGER NOT NULL DEFAULT 0,
  "watchRewardCount" INTEGER NOT NULL DEFAULT 0,
  "milestone100"     BOOLEAN NOT NULL DEFAULT false,
  "milestone1k"      BOOLEAN NOT NULL DEFAULT false,
  "milestone10k"     BOOLEAN NOT NULL DEFAULT false,
  "zahabRewarded"    BOOLEAN NOT NULL DEFAULT false,
  "rewardAmount"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "publishedAt"      TIMESTAMP(3),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GamadTubeVideo_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GamadTubeVideo_slug_key" ON "GamadTubeVideo"("slug");
ALTER TABLE "GamadTubeVideo" ADD CONSTRAINT IF NOT EXISTS "GamadTubeVideo_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "GamadId"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GamadTubeVideo" ADD CONSTRAINT IF NOT EXISTS "GamadTubeVideo_channelId_fkey"
  FOREIGN KEY ("channelId") REFERENCES "VideoChannel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GamadTubeVideo" ADD CONSTRAINT IF NOT EXISTS "GamadTubeVideo_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "VideoCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- VideoWatch
CREATE TABLE IF NOT EXISTS "VideoWatch" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
  "videoId"   TEXT NOT NULL,
  "gamadId"   TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VideoWatch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VideoWatch_videoId_gamadId_key" ON "VideoWatch"("videoId", "gamadId");
ALTER TABLE "VideoWatch" ADD CONSTRAINT IF NOT EXISTS "VideoWatch_videoId_fkey"
  FOREIGN KEY ("videoId") REFERENCES "GamadTubeVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VideoWatch" ADD CONSTRAINT IF NOT EXISTS "VideoWatch_gamadId_fkey"
  FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- VideoLike
CREATE TABLE IF NOT EXISTS "VideoLike" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
  "videoId"   TEXT NOT NULL,
  "gamadId"   TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VideoLike_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VideoLike_videoId_gamadId_key" ON "VideoLike"("videoId", "gamadId");
ALTER TABLE "VideoLike" ADD CONSTRAINT IF NOT EXISTS "VideoLike_videoId_fkey"
  FOREIGN KEY ("videoId") REFERENCES "GamadTubeVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VideoLike" ADD CONSTRAINT IF NOT EXISTS "VideoLike_gamadId_fkey"
  FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- VideoComment
CREATE TABLE IF NOT EXISTS "VideoComment" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
  "videoId"   TEXT NOT NULL,
  "gamadId"   TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VideoComment_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "VideoComment" ADD CONSTRAINT IF NOT EXISTS "VideoComment_videoId_fkey"
  FOREIGN KEY ("videoId") REFERENCES "GamadTubeVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VideoComment" ADD CONSTRAINT IF NOT EXISTS "VideoComment_gamadId_fkey"
  FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE CASCADE ON UPDATE CASCADE;
