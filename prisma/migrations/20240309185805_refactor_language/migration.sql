/*
  Warnings:

  - The `language` column on the `UserSettings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN_GB', 'SK_SK');

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN_GB';
