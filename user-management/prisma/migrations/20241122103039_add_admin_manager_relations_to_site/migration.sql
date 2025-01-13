-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "adminId" INTEGER,
ADD COLUMN     "managerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
