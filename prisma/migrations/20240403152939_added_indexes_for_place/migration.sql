-- DropIndex
DROP INDEX "Place_latitude_longitude_name_idx";

-- CreateIndex
CREATE INDEX "Place_latitude_longitude_name_description_qr_identifier_typ_idx" ON "Place"("latitude", "longitude", "name", "description", "qr_identifier", "type", "region");
