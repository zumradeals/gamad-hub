-- Phase C: Moderation System
-- Migration: 20260514000004_moderation_system

-- New enums
CREATE TYPE "ReportReason" AS ENUM (
  'SPAM', 'HATE_SPEECH', 'MISINFORMATION', 'HARASSMENT',
  'INAPPROPRIATE_CONTENT', 'COPYRIGHT', 'OTHER'
);

CREATE TYPE "ReportStatus" AS ENUM (
  'PENDING', 'UNDER_REVIEW', 'VALIDATED', 'DISMISSED'
);

CREATE TYPE "FilterSeverity" AS ENUM ('BLOCK', 'FLAG');

-- ContentReport : signalements de contenu
CREATE TABLE "ContentReport" (
  "id"          TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "reporterId"  TEXT         NOT NULL,
  "contentId"   TEXT         NOT NULL,
  "contentType" TEXT         NOT NULL,
  "reason"      "ReportReason" NOT NULL,
  "note"        TEXT,
  "status"      "ReportStatus" NOT NULL DEFAULT 'PENDING',
  "reviewerId"  TEXT,
  "reviewNote"  TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt"  TIMESTAMP(3),

  CONSTRAINT "ContentReport_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContentReport_reporterId_fkey"
    FOREIGN KEY ("reporterId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ContentReport_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "GamadId"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ContentReport_reporterId_contentId_contentType_key"
  ON "ContentReport"("reporterId", "contentId", "contentType");

-- ContentFilterRule : liste noire de mots
CREATE TABLE "ContentFilterRule" (
  "id"        TEXT           NOT NULL DEFAULT gen_random_uuid()::text,
  "keyword"   TEXT           NOT NULL,
  "severity"  "FilterSeverity" NOT NULL DEFAULT 'FLAG',
  "createdAt" TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT           NOT NULL,

  CONSTRAINT "ContentFilterRule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentFilterRule_keyword_key" ON "ContentFilterRule"("keyword");

-- Graines : quelques mots interdits évidents
INSERT INTO "ContentFilterRule" ("keyword", "severity", "createdBy") VALUES
  ('spam',     'FLAG',  'system'),
  ('scam',     'BLOCK', 'system'),
  ('arnaque',  'BLOCK', 'system'),
  ('haine',    'FLAG',  'system'),
  ('violence', 'FLAG',  'system');
