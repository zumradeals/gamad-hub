-- CreateEnum: PageStatus
CREATE TYPE "PageStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum: PageProductType
CREATE TYPE "PageProductType" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateTable: ZumaraPage
CREATE TABLE "ZumaraPage" (
  "id"          TEXT NOT NULL,
  "cellId"      TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "tagline"     TEXT,
  "description" TEXT,
  "logoUrl"     TEXT,
  "coverUrl"    TEXT,
  "category"    TEXT,
  "website"     TEXT,
  "email"       TEXT,
  "country"     TEXT,
  "city"        TEXT,
  "status"      "PageStatus" NOT NULL DEFAULT 'ACTIVE',
  "followCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ZumaraPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ZumaraPagePost
CREATE TABLE "ZumaraPagePost" (
  "id"        TEXT NOT NULL,
  "pageId"    TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "imageUrl"  TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ZumaraPagePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ZumaraPageProduct
CREATE TABLE "ZumaraPageProduct" (
  "id"          TEXT NOT NULL,
  "pageId"      TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "imageUrl"    TEXT,
  "price"       DOUBLE PRECISION,
  "currency"    TEXT NOT NULL DEFAULT 'ZAHAB',
  "type"        "PageProductType" NOT NULL DEFAULT 'SERVICE',
  "available"   BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ZumaraPageProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ZumaraPageFollow
CREATE TABLE "ZumaraPageFollow" (
  "id"        TEXT NOT NULL,
  "pageId"    TEXT NOT NULL,
  "gamadId"   TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ZumaraPageFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZumaraPage_cellId_key"  ON "ZumaraPage"("cellId");
CREATE UNIQUE INDEX "ZumaraPage_slug_key"     ON "ZumaraPage"("slug");
CREATE UNIQUE INDEX "ZumaraPageFollow_pageId_gamadId_key" ON "ZumaraPageFollow"("pageId", "gamadId");

-- AddForeignKey
ALTER TABLE "ZumaraPage" ADD CONSTRAINT "ZumaraPage_cellId_fkey"
  FOREIGN KEY ("cellId") REFERENCES "ZumaraCell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ZumaraPagePost" ADD CONSTRAINT "ZumaraPagePost_pageId_fkey"
  FOREIGN KEY ("pageId") REFERENCES "ZumaraPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ZumaraPageProduct" ADD CONSTRAINT "ZumaraPageProduct_pageId_fkey"
  FOREIGN KEY ("pageId") REFERENCES "ZumaraPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ZumaraPageFollow" ADD CONSTRAINT "ZumaraPageFollow_pageId_fkey"
  FOREIGN KEY ("pageId") REFERENCES "ZumaraPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ZumaraPageFollow" ADD CONSTRAINT "ZumaraPageFollow_gamadId_fkey"
  FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
