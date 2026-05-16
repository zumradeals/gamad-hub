-- AlterEnum
ALTER TYPE "ZahabTransactionReason" ADD VALUE 'ARTICLE_READ';
ALTER TYPE "ZahabTransactionReason" ADD VALUE 'ARTICLE_LIKED';
ALTER TYPE "ZahabTransactionReason" ADD VALUE 'MARKET_PURCHASE';

-- AlterTable Article
ALTER TABLE "Article"
  ADD COLUMN IF NOT EXISTS "videoUrl"        TEXT,
  ADD COLUMN IF NOT EXISTS "tags"            TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "sponsored"       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "sponsorName"     TEXT,
  ADD COLUMN IF NOT EXISTS "sponsorUrl"      TEXT,
  ADD COLUMN IF NOT EXISTS "editorId"        TEXT,
  ADD COLUMN IF NOT EXISTS "rejectionNote"   TEXT,
  ADD COLUMN IF NOT EXISTS "readRewardCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "likesCount"      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "readingTimeMin"  INTEGER;

-- CreateTable ArticleRead
CREATE TABLE "ArticleRead" (
    "id"         TEXT NOT NULL,
    "articleId"  TEXT NOT NULL,
    "gamadId"    TEXT NOT NULL,
    "rewardedAt" TIMESTAMP(3),
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleRead_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ArticleRead_articleId_gamadId_key" ON "ArticleRead"("articleId", "gamadId");

-- CreateTable ArticleLike
CREATE TABLE "ArticleLike" (
    "id"        TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "gamadId"   TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleLike_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ArticleLike_articleId_gamadId_key" ON "ArticleLike"("articleId", "gamadId");

-- CreateTable ArticleComment
CREATE TABLE "ArticleComment" (
    "id"        TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "gamadId"   TEXT NOT NULL,
    "content"   TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArticleComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable ModuleConfig
CREATE TABLE "ModuleConfig" (
    "id"        TEXT NOT NULL,
    "module"    TEXT NOT NULL,
    "key"       TEXT NOT NULL,
    "value"     TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ModuleConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ModuleConfig_module_key_key" ON "ModuleConfig"("module", "key");

-- CreateTable ModuleRole
CREATE TABLE "ModuleRole" (
    "id"        TEXT NOT NULL,
    "module"    TEXT NOT NULL,
    "gamadId"   TEXT NOT NULL,
    "role"      TEXT NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "active"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ModuleRole_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ModuleRole_module_gamadId_role_key" ON "ModuleRole"("module", "gamadId", "role");

-- AddForeignKey
ALTER TABLE "ArticleRead"    ADD CONSTRAINT "ArticleRead_articleId_fkey"    FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ArticleRead"    ADD CONSTRAINT "ArticleRead_gamadId_fkey"      FOREIGN KEY ("gamadId")   REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ArticleLike"    ADD CONSTRAINT "ArticleLike_articleId_fkey"    FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ArticleLike"    ADD CONSTRAINT "ArticleLike_gamadId_fkey"      FOREIGN KEY ("gamadId")   REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ArticleComment" ADD CONSTRAINT "ArticleComment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ArticleComment" ADD CONSTRAINT "ArticleComment_gamadId_fkey"   FOREIGN KEY ("gamadId")   REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ModuleRole"     ADD CONSTRAINT "ModuleRole_gamadId_fkey"       FOREIGN KEY ("gamadId")   REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
