-- Create the BookingService junction table
CREATE TABLE "booking_services" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_services_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint to prevent duplicate service entries for the same booking
CREATE UNIQUE INDEX "booking_services_bookingId_serviceId_key" ON "booking_services"("bookingId", "serviceId");

-- Add foreign keys
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data: copy serviceId from bookings to booking_services
INSERT INTO "booking_services" ("id", "bookingId", "serviceId", "createdAt")
SELECT 
  CONCAT('bs_', gen_random_uuid()::text),
  "id",
  "serviceId",
  CURRENT_TIMESTAMP
FROM "bookings"
WHERE "serviceId" IS NOT NULL;

-- Drop the foreign key constraint first
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_serviceId_fkey";

-- Drop the serviceId column
ALTER TABLE "bookings" DROP COLUMN "serviceId";
