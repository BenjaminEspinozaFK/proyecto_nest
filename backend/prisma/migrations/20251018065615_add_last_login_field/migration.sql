-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "lastLogin" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLogin" TIMESTAMP(3);
