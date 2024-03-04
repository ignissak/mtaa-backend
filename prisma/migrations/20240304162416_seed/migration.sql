-- AlterEnum
ALTER TYPE "LinkType" ADD VALUE 'WIKI';

-- AlterEnum
ALTER TYPE "PlaceType" ADD VALUE 'CASTLE';

-- DropForeignKey
ALTER TABLE "ExternalLink" DROP CONSTRAINT "ExternalLink_placeId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_placeId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_placeId_fkey";

-- DropForeignKey
ALTER TABLE "UserVisitedPlaces" DROP CONSTRAINT "UserVisitedPlaces_placeId_fkey";

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Place_latitude_longitude_name_idx" ON "Place"("latitude", "longitude", "name");

-- CreateIndex
CREATE INDEX "User_email_points_idx" ON "User"("email", "points");

-- AddForeignKey
ALTER TABLE "UserVisitedPlaces" ADD CONSTRAINT "UserVisitedPlaces_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalLink" ADD CONSTRAINT "ExternalLink_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
