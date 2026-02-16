-- AlterTable
ALTER TABLE "events" ADD COLUMN "priceFullEventFood" DECIMAL(10,2),
ADD COLUMN "priceFullEventAccommodation" DECIMAL(10,2),
ADD COLUMN "priceFullEventBoth" DECIMAL(10,2),
ADD COLUMN "priceDailyFood" DECIMAL(10,2),
ADD COLUMN "priceDailyNoFood" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "applications" ADD COLUMN "pricingOption" TEXT,
ADD COLUMN "numberOfDays" INTEGER,
ADD COLUMN "totalPrice" DECIMAL(10,2);
