/*
  Warnings:

  - You are about to drop the column `sellerReviews` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "sellerReviews";

-- CreateTable
CREATE TABLE "Reviews" (
    "id" SERIAL NOT NULL,
    "reviewRating" INTEGER NOT NULL,
    "rewiews" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reviews_productId_idx" ON "Reviews"("productId");

-- CreateIndex
CREATE INDEX "Reviews_authorId_idx" ON "Reviews"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_authorId_productId_key" ON "Reviews"("authorId", "productId");

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
