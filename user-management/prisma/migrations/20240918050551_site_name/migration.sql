/*
  Warnings:

  - A unique constraint covering the columns `[customerName]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[service_name]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[siteName]` on the table `Site` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerName_key" ON "Customer"("customerName");

-- CreateIndex
CREATE UNIQUE INDEX "Service_service_name_key" ON "Service"("service_name");

-- CreateIndex
CREATE UNIQUE INDEX "Site_siteName_key" ON "Site"("siteName");
