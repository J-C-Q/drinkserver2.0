-- Removes duplicate achievement ids that concurrent award runs could append
-- before awards became a single conditional update. Keeps the first
-- occurrence of each id, in order. Data only; the schema is unchanged.
BEGIN;

UPDATE "User"
SET "achievements" = ARRAY(
    SELECT a
    FROM unnest("achievements") WITH ORDINALITY AS t(a, n)
    GROUP BY a
    ORDER BY min(n)
)
WHERE cardinality("achievements") > (SELECT count(DISTINCT a) FROM unnest("achievements") AS a);

COMMIT;
