/*
  Warnings:

  - You are about to drop the column `adminId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `managerId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `_UserTickets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_managerId_fkey";

-- DropForeignKey
ALTER TABLE "_UserTickets" DROP CONSTRAINT "_UserTickets_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserTickets" DROP CONSTRAINT "_UserTickets_B_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "adminId",
DROP COLUMN "managerId",
ADD COLUMN     "userId" INTEGER;

-- DropTable
DROP TABLE "_UserTickets";

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
