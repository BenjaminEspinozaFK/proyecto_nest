/*
  Warnings:

  - You are about to drop the column `banco` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `banco` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "banco";

-- AlterTable
ALTER TABLE "GasVoucher" ADD COLUMN     "bank" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "banco";
