/*
  Warnings:

  - Added the required column `CategoryId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserID` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_password_key";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "CategoryId" INTEGER NOT NULL,
ADD COLUMN     "UserID" TEXT NOT NULL,
ADD COLUMN     "authorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
