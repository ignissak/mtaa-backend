-- CreateEnum
CREATE TYPE "Region" AS ENUM ('BRATISLAVA', 'TRNAVA', 'TRENCIN', 'NITRA', 'ZILINA', 'BANSKA_BYSTRICA', 'PRESOV', 'KOSICE', 'OTHER');

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "region" "Region" NOT NULL DEFAULT 'OTHER';