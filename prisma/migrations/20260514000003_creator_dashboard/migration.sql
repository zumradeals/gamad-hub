-- Phase B: Creator Dashboard — Article milestones + ZAHAB article rewards
-- Migration: 20260514000003_creator_dashboard

-- Add milestone fields to Article
ALTER TABLE "Article"
  ADD COLUMN IF NOT EXISTS "milestone100" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "milestone1k"  BOOLEAN NOT NULL DEFAULT false;

-- Add author FK relation to Article (authorId column already exists)
-- Create FK constraint pointing to GamadId
ALTER TABLE "Article"
  ADD CONSTRAINT "Article_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "GamadId"("id")
  ON DELETE SET NULL ON UPDATE CASCADE
  NOT VALID;

-- Add new ZahabTransactionReason enum values
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'ARTICLE_PUBLISHED';
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'ARTICLE_MILESTONE_100';
ALTER TYPE "ZahabTransactionReason" ADD VALUE IF NOT EXISTS 'ARTICLE_MILESTONE_1K';
