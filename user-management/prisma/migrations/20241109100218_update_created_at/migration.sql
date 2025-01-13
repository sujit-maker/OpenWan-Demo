/*
  Warnings:

  - You are about to drop the column `DateTime` on the `MikroTik` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MikroTik" DROP COLUMN "DateTime",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
