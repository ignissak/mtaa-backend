/*
  Warnings:

  - The `darkMode` column on the `UserSettings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Appearance" AS ENUM ('LIGHT_MODE', 'DARK_MODE', 'SYSTEM');

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "darkMode",
ADD COLUMN     "appearance" "Appearance" NOT NULL DEFAULT 'SYSTEM';
