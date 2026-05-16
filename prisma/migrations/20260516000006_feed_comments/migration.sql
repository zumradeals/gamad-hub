-- CreateTable: PortalFeedComment
CREATE TABLE "PortalFeedComment" (
  "id"        TEXT NOT NULL,
  "postId"    TEXT NOT NULL,
  "gamadId"   TEXT NOT NULL,
  "content"   VARCHAR(500) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PortalFeedComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PortalFeedComment" ADD CONSTRAINT "PortalFeedComment_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "PortalFeedPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PortalFeedComment" ADD CONSTRAINT "PortalFeedComment_gamadId_fkey"
  FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
