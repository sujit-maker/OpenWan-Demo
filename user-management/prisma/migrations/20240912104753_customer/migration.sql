/*
  Warnings:

  - You are about to drop the column `address` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contactName` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerAddress` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_customerId_fkey";

-- DropIndex
DROP INDEX "Customer_gstNumber_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "address",
DROP COLUMN "name",
ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "contactNumber" INTEGER NOT NULL,
ADD COLUMN     "customerAddress" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL;

-- DropTable
DROP TABLE "Contact";
