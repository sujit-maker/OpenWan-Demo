/*
  Warnings:

  - You are about to drop the column `email` on the `Device` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Device" DROP COLUMN "email",
ADD COLUMN     "emailId" TEXT;
