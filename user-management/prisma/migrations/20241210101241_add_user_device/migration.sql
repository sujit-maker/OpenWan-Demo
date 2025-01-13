-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_deviceId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "deviceId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("deviceId") ON DELETE SET NULL ON UPDATE CASCADE;
