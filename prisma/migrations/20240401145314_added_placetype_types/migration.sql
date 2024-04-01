/*
  Warnings:

  - The values [RESTAURANT,BAR,CAFE,MUSEUM,PARK,BEACH,CASTLE] on the enum `PlaceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- AlterEnum
BEGIN;
CREATE TYPE "PlaceType_new" AS ENUM ('PARKS_AND_GARDENS', 'CHURCHES', 'CASTLES', 'MUSEUMS', 'GALLERIES', 'MONUMENTS', 'MEMORIALS', 'STATUES', 'WELLS_AND_SPRINGS', 'LAKES', 'RIVERS', 'MOUNTAINS', 'CAVES', 'WATERFALLS', 'MILLS', 'BRIDGES', 'TOWERS', 'OTHER');
ALTER TABLE "Place" ALTER COLUMN "type" TYPE "PlaceType_new" USING ("type"::text::"PlaceType_new");
ALTER TYPE "PlaceType" RENAME TO "PlaceType_old";
ALTER TYPE "PlaceType_new" RENAME TO "PlaceType";
DROP TYPE "PlaceType_old";
COMMIT;
