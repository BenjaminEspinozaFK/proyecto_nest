/*
  Warnings:

  - You are about to drop the column `age` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rut]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rut]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rut` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rut` to the `User` table without a default value. This is not possible if the table is not empty.

*/

-- Paso 1: Agregar columna rut como nullable temporalmente
ALTER TABLE "Admin" ADD COLUMN "rut" TEXT;
ALTER TABLE "User" ADD COLUMN "rut" TEXT;

-- Paso 2: Generar RUTs temporales únicos para registros existentes
UPDATE "Admin" SET "rut" = 'ADMIN-' || id WHERE "rut" IS NULL;
UPDATE "User" SET "rut" = 'USER-' || id WHERE "rut" IS NULL;

-- Paso 3: Hacer la columna NOT NULL
ALTER TABLE "Admin" ALTER COLUMN "rut" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "rut" SET NOT NULL;

-- Paso 4: Eliminar la columna age
ALTER TABLE "Admin" DROP COLUMN "age";
ALTER TABLE "User" DROP COLUMN "age";

-- CreateIndex
CREATE UNIQUE INDEX "Admin_rut_key" ON "Admin"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "User_rut_key" ON "User"("rut");
