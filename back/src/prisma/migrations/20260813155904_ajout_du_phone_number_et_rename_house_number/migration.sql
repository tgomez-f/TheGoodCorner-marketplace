/*
  Warnings:

  - You are about to drop the column `house_number` on the `Location` table. All the data in the column will be lost.
  - Added the required column `houseNumber` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "house_number",
ADD COLUMN     "houseNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" INTEGER;
