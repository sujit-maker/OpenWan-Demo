/*
  Warnings:

  - You are about to drop the column `service_id` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `service_name` on the `Service` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serviceId]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serviceName]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serviceId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceName` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Service_service_name_key";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "service_id",
DROP COLUMN "service_name",
ADD COLUMN     "serviceId" TEXT NOT NULL,
ADD COLUMN     "serviceName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Service_serviceId_key" ON "Service"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_serviceName_key" ON "Service"("serviceName");
