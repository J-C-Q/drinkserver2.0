-- Nutrition values stored on each order at purchase time.
-- Additive only: the previous application version keeps working, so this can
-- be deployed before the code that uses it.
BEGIN;

ALTER TABLE "Order" ADD COLUMN "sugar" DOUBLE PRECISION,
ADD COLUMN "caffeine" DOUBLE PRECISION;

-- Existing orders get the item's current values, the best information
-- available; they are what the stats page showed until now.
UPDATE "Order" o
SET "sugar" = i."sugar", "caffeine" = i."caffeine"
FROM "Item" i
WHERE i."itemid" = o."itemid";

COMMIT;
