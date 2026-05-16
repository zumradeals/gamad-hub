-- AlterTable: add optional cellId to PortalFeedPost
ALTER TABLE "PortalFeedPost" ADD COLUMN "cellId" TEXT;

-- AddForeignKey
ALTER TABLE "PortalFeedPost" ADD CONSTRAINT "PortalFeedPost_cellId_fkey"
  FOREIGN KEY ("cellId") REFERENCES "ZumaraCell"("id") ON DELETE SET NULL ON UPDATE CASCADE;
