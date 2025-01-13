/*
  Warnings:

  - Made the column `customerName` on table `Site` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Site" DROP CONSTRAINT "Site_customerName_fkey";

-- AlterTable
ALTER TABLE "Site" ALTER COLUMN "customerName" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_customerName_fkey" FOREIGN KEY ("customerName") REFERENCES "Customer"("customerName") ON DELETE RESTRICT ON UPDATE CASCADE;
