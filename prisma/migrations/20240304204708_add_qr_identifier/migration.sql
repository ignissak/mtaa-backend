/*
  Warnings:

  - A unique constraint covering the columns `[qr_identifier]` on the table `Place` will be added. If there are existing duplicate values, this will fail.
  - The required column `qr_identifier` was added to the `Place` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "qr_identifier" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Place_qr_identifier_key" ON "Place"("qr_identifier");
