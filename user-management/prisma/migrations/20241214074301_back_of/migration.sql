/*
  Warnings:

  - You are about to drop the column `wan1Enabled` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `wan2Enabled` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `wan3Enabled` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `wan4Enabled` on the `Device` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Device" DROP COLUMN "wan1Enabled",
DROP COLUMN "wan2Enabled",
DROP COLUMN "wan3Enabled",
DROP COLUMN "wan4Enabled";
