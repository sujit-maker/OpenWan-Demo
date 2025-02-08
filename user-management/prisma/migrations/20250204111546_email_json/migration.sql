/*
  Warnings:

  - The `email` column on the `Customer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `contactEmail` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "email",
ADD COLUMN     "email" JSONB;

-- AlterTable
ALTER TABLE "Site" DROP COLUMN "contactEmail",
ADD COLUMN     "contactEmail" JSONB;
