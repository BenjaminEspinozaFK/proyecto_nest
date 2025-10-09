-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'admin';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
