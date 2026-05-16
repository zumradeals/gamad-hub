-- Phase E0 — GamadTube module

-- Enum ZahabTransactionReason: add video values
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'VIDEO_WATCHED';
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'VIDEO_LIKED';
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'VIDEO_PUBLISHED';
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'VIDEO_MILESTONE_100';
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'VIDEO_MILESTONE_1K';
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'VIDEO_MILESTONE_10K';

-- Enum VideoStatus
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
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VideoChannel_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VideoChannel_slug_key" ON "VideoChannel"("slug");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VideoChannel_gamadId_fkey') THEN
    ALTER TABLE "VideoChannel" ADD CONSTRAINT "VideoChannel_gamadId_fkey"
      FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

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
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GamadTubeVideo_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GamadTubeVideo_slug_key" ON "GamadTubeVideo"("slug");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GamadTubeVideo_authorId_fkey') THEN
    ALTER TABLE "GamadTubeVideo" ADD CONSTRAINT "GamadTubeVideo_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "GamadId"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GamadTubeVideo_channelId_fkey') THEN
    ALTER TABLE "GamadTubeVideo" ADD CONSTRAINT "GamadTubeVideo_channelId_fkey"
      FOREIGN KEY ("channelId") REFERENCES "VideoChannel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GamadTubeVideo_categoryId_fkey') THEN
    ALTER TABLE "GamadTubeVideo" ADD CONSTRAINT "GamadTubeVideo_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "VideoCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- VideoWatch
CREATE TABLE IF NOT EXISTS "VideoWatch" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
  "videoId"   TEXT NOT NULL,
  "gamadId"   TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VideoWatch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VideoWatch_videoId_gamadId_key" ON "VideoWatch"("videoId", "gamadId");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VideoWatch_videoId_fkey') THEN
    ALTER TABLE "VideoWatch" ADD CONSTRAINT "VideoWatch_videoId_fkey"
      FOREIGN KEY ("videoId") REFERENCES "GamadTubeVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VideoWatch_gamadId_fkey') THEN
    ALTER TABLE "VideoWatch" ADD CONSTRAINT "VideoWatch_gamadId_fkey"
      FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- VideoLike
CREATE TABLE IF NOT EXISTS "VideoLike" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
  "videoId"   TEXT NOT NULL,
  "gamadId"   TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VideoLike_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VideoLike_videoId_gamadId_key" ON "VideoLike"("videoId", "gamadId");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VideoLike_videoId_fkey') THEN
    ALTER TABLE "VideoLike" ADD CONSTRAINT "VideoLike_videoId_fkey"
      FOREIGN KEY ("videoId") REFERENCES "GamadTubeVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VideoLike_gamadId_fkey') THEN
    ALTER TABLE "VideoLike" ADD CONSTRAINT "VideoLike_gamadId_fkey"
      FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- VideoComment
CREATE TABLE IF NOT EXISTS "VideoComment" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
  "videoId"   TEXT NOT NULL,
  "gamadId"   TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VideoComment_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VideoComment_videoId_fkey') THEN
    ALTER TABLE "VideoComment" ADD CONSTRAINT "VideoComment_videoId_fkey"
      FOREIGN KEY ("videoId") REFERENCES "GamadTubeVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VideoComment_gamadId_fkey') THEN
    ALTER TABLE "VideoComment" ADD CONSTRAINT "VideoComment_gamadId_fkey"
      FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
