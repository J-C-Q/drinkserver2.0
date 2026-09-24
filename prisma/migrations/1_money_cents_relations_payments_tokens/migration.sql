-- Money as integer cents, order relations and indexes, payment records,
-- hashed tokens, rate limits and password-change tracking.
-- Written by hand from `prisma migrate diff`: the generated SQL drops the
-- price columns instead of converting them. Runs in one transaction, so a
-- failure leaves the database unchanged.
BEGIN;

-- Prices: Float euros -> Int cents, rounded half away from zero.
-- Some 2024 orders stored sub-cent prices (e.g. 0.9371); rounding them
-- changes historical totals by a few cents and no unpaid balance.
ALTER TABLE "Item" ADD COLUMN "priceCents" INTEGER;
UPDATE "Item" SET "priceCents" = ROUND("itemprice"::numeric * 100);
ALTER TABLE "Item" ALTER COLUMN "priceCents" SET NOT NULL;
ALTER TABLE "Item" DROP COLUMN "itemprice";

ALTER TABLE "Order" ADD COLUMN "priceCents" INTEGER;
UPDATE "Order" SET "priceCents" = ROUND("itemprice"::numeric * 100);
ALTER TABLE "Order" ALTER COLUMN "priceCents" SET NOT NULL;
ALTER TABLE "Order" DROP COLUMN "itemprice";

ALTER TABLE "Item" ADD CONSTRAINT "Item_priceCents_nonnegative" CHECK ("priceCents" >= 0);
ALTER TABLE "Item" ADD CONSTRAINT "Item_quantity_nonnegative" CHECK ("quantity" >= 0);
ALTER TABLE "Order" ADD CONSTRAINT "Order_priceCents_nonnegative" CHECK ("priceCents" >= 0);

-- Tokens are stored as SHA-256 hashes from now on. Existing plaintext tokens
-- cannot be converted into lookups by hash, so they are removed; they expire
-- after an hour anyway and users can request a new email.
DELETE FROM "VerificationToken";
DELETE FROM "PasswordResetToken";

DROP INDEX "PasswordResetToken_email_token_key";
DROP INDEX "PasswordResetToken_token_key";
DROP INDEX "VerificationToken_email_token_key";
DROP INDEX "VerificationToken_token_key";

ALTER TABLE "PasswordResetToken" DROP COLUMN "token",
ADD COLUMN "tokenHash" TEXT NOT NULL;

ALTER TABLE "VerificationToken" DROP COLUMN "token",
ADD COLUMN "tokenHash" TEXT NOT NULL;

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");
CREATE UNIQUE INDEX "VerificationToken_tokenHash_key" ON "VerificationToken"("tokenHash");
CREATE INDEX "VerificationToken_email_idx" ON "VerificationToken"("email");

-- Sessions from before a password change are rejected.
ALTER TABLE "User" ADD COLUMN "passwordChangedAt" TIMESTAMP(3);

-- Payments settle an explicit set of orders.
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "ordersCents" INTEGER NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedById" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Payment_amountCents_nonnegative" CHECK ("amountCents" >= 0),
    CONSTRAINT "Payment_ordersCents_nonnegative" CHECK ("ordersCents" >= 0)
);

CREATE INDEX "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt");

ALTER TABLE "Order" ADD COLUMN "paymentId" TEXT;

CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimit_windowStart_idx" ON "RateLimit"("windowStart");

-- Order indexes for the per-user and per-status queries.
CREATE INDEX "Order_userId_status_date_idx" ON "Order"("userId", "status", "date");
CREATE INDEX "Order_userId_date_idx" ON "Order"("userId", "date");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_paymentId_idx" ON "Order"("paymentId");

-- Foreign keys. Existing orders all reference existing users and items
-- (checked against a restored production backup before writing this).
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_itemid_fkey" FOREIGN KEY ("itemid") REFERENCES "Item"("itemid") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
