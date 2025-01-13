-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deviceId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
