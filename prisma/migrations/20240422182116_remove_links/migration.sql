/*
  Warnings:

  - You are about to drop the `ExternalLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExternalLink" DROP CONSTRAINT "ExternalLink_placeId_fkey";

-- DropTable
DROP TABLE "ExternalLink";
