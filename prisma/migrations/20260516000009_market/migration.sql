-- CreateEnum
CREATE TYPE "MarketOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MarketPaymentMethod" AS ENUM ('ZAHAB', 'WAVE', 'ORANGE_MONEY');

-- AlterTable
ALTER TABLE "ZumaraPageProduct" ADD COLUMN IF NOT EXISTS "orders" TEXT;

-- CreateTable
CREATE TABLE "MarketOrder" (
    "id"            TEXT NOT NULL,
    "productId"     TEXT NOT NULL,
    "buyerGamadId"  TEXT NOT NULL,
    "quantity"      INTEGER NOT NULL DEFAULT 1,
    "unitPrice"     DOUBLE PRECISION NOT NULL,
    "totalPrice"    DOUBLE PRECISION NOT NULL,
    "currency"      TEXT NOT NULL DEFAULT 'ZAHAB',
    "paymentMethod" "MarketPaymentMethod" NOT NULL DEFAULT 'ZAHAB',
    "status"        "MarketOrderStatus" NOT NULL DEFAULT 'PENDING',
    "note"          TEXT,
    "paymentRef"    TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MarketOrder" ADD CONSTRAINT "MarketOrder_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "ZumaraPageProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketOrder" ADD CONSTRAINT "MarketOrder_buyerGamadId_fkey"
    FOREIGN KEY ("buyerGamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
