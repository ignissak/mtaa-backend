/*
  Warnings:

  - The primary key for the `UserVisitedPlaces` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserVisitedPlaces` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserVisitedPlaces" DROP CONSTRAINT "UserVisitedPlaces_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "UserVisitedPlaces_pkey" PRIMARY KEY ("userId", "placeId");
