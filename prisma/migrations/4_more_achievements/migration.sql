-- More achievements. Rules are in src/lib/achievement-rules.ts, by name.
-- Users earn them from their existing history on their next order or the
-- next daily cron run. Existing achievements with these names are kept.
BEGIN;

INSERT INTO "Achievement" ("id", "name", "description", "rarity") VALUES
    (gen_random_uuid()::text, 'Stammgast', '250 drinks. They know your order by heart.', 'RARE'),
    (gen_random_uuid()::text, 'Legend', '500 drinks. There should be a plaque.', 'LEGENDARY'),
    (gen_random_uuid()::text, 'Anniversary', 'Still ordering a year after your first drink.', 'RARE'),
    (gen_random_uuid()::text, 'Comeback', 'Ordered again after a break of 30 days or more.', 'COMMON'),
    (gen_random_uuid()::text, 'Perfect Week', 'A drink on every day from Monday to Friday of the same week.', 'RARE'),
    (gen_random_uuid()::text, 'Iron Liver', 'A drink on 20 working days in a row.', 'LEGENDARY'),
    (gen_random_uuid()::text, 'Full Calendar', 'Ordered on every day of the week, Saturday and Sunday included.', 'RARE'),
    (gen_random_uuid()::text, 'Lunch Break', 'Ordered between 12:00 and 13:00.', 'COMMON'),
    (gen_random_uuid()::text, 'Feierabend', 'Ordered on a Friday after 17:00.', 'COMMON'),
    (gen_random_uuid()::text, 'Double Fisting', 'Two orders within 60 seconds.', 'COMMON'),
    (gen_random_uuid()::text, 'Silent Night', 'Ordered at Christmas or on New Year''s Day.', 'RARE'),
    (gen_random_uuid()::text, 'Pi Day', 'Ordered on 14 March.', 'RARE'),
    (gen_random_uuid()::text, 'Friday the 13th', 'Ordered on a Friday the 13th.', 'RARE'),
    (gen_random_uuid()::text, 'Sommelier', 'Tried 10 different drinks.', 'RARE'),
    (gen_random_uuid()::text, 'Rainbow', '4 different drinks on one day.', 'RARE'),
    (gen_random_uuid()::text, 'Creature of Habit', 'The same drink 15 times in a row.', 'RARE'),
    (gen_random_uuid()::text, 'Brand Ambassador', '50 bottles of one drink.', 'RARE'),
    (gen_random_uuid()::text, 'Sugar Mountain', '1 kg of sugar in total.', 'RARE'),
    (gen_random_uuid()::text, 'Espresso Machine', '10 g of caffeine in total, about 125 espressos.', 'RARE'),
    (gen_random_uuid()::text, 'Hydrated', '10 drinks without sugar or caffeine.', 'COMMON'),
    (gen_random_uuid()::text, 'Clean Week', 'At least 5 drinks in a week, all sugar-free.', 'RARE'),
    (gen_random_uuid()::text, 'Decaf Day', 'At least 3 drinks on a day, all caffeine-free.', 'COMMON'),
    (gen_random_uuid()::text, 'Marathon', '2600 kcal of drinks in total, about one marathon.', 'RARE'),
    (gen_random_uuid()::text, 'Big Spender', '100 € spent on drinks.', 'RARE'),
    (gen_random_uuid()::text, 'Clean Slate', 'Your first payment.', 'COMMON'),
    (gen_random_uuid()::text, 'Tip Jar', 'Paid more than you owed.', 'RARE'),
    (gen_random_uuid()::text, 'Good Standing', 'Paid within 7 days of your oldest open order.', 'COMMON'),
    (gen_random_uuid()::text, 'Last One', 'Bought the last bottle in stock.', 'RARE'),
    (gen_random_uuid()::text, 'Trendsetter', 'The first person ever to order a drink.', 'RARE'),
    (gen_random_uuid()::text, 'Happy Hour', 'At least 3 other people ordered within 10 minutes of you.', 'COMMON'),
    (gen_random_uuid()::text, 'Top of the Month', 'Most drinks of anyone in a calendar month.', 'LEGENDARY')
ON CONFLICT ("name") DO NOTHING;

-- For finding orders close in time to another order (Happy Hour).
CREATE INDEX "Order_date_idx" ON "Order"("date");

COMMIT;
