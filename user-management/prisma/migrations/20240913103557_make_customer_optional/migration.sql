/*
  Warnings:

  - You are about to drop the column `customerId` on the `Site` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerName]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Site" DROP CONSTRAINT "Site_customerId_fkey";

-- AlterTable
ALTER TABLE "Site" DROP COLUMN "customerId",
ADD COLUMN     "customerName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerName_key" ON "Customer"("customerName");

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_customerName_fkey" FOREIGN KEY ("customerName") REFERENCES "Customer"("customerName") ON DELETE SET NULL ON UPDATE CASCADE;
