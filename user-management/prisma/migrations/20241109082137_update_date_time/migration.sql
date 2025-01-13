/*
  Warnings:

  - You are about to drop the column `timeStamp` on the `MikroTik` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MikroTik" DROP COLUMN "timeStamp",
ADD COLUMN     "DateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
