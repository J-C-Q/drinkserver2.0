import { db } from "@/lib/db";

// Fixed-window counter in Postgres, so the limit holds across serverless
// instances. Returns true while `key` has made at most `limit` attempts in
// the current window of `windowSeconds`.
export const rateLimit = async (key: string, limit: number, windowSeconds: number) => {
    try {
        // Timestamps come from the database clock in UTC, matching how Prisma
        // stores DateTime columns.
        const rows = await db.$queryRaw<{ count: number }[]>`
            INSERT INTO "RateLimit" ("key", "count", "windowStart")
            VALUES (${key}, 1, now() AT TIME ZONE 'UTC')
            ON CONFLICT ("key") DO UPDATE SET
                "count" = CASE
                    WHEN "RateLimit"."windowStart" <= (now() AT TIME ZONE 'UTC') - ${windowSeconds} * interval '1 second'
                    THEN 1 ELSE "RateLimit"."count" + 1 END,
                "windowStart" = CASE
                    WHEN "RateLimit"."windowStart" <= (now() AT TIME ZONE 'UTC') - ${windowSeconds} * interval '1 second'
                    THEN now() AT TIME ZONE 'UTC' ELSE "RateLimit"."windowStart" END
            RETURNING "count"`;

        // Occasionally drop counters that are long expired.
        if (Math.random() < 0.01) {
            await db.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 24 * 3600 * 1000) } } });
        }
        return rows[0].count <= limit;
    } catch (error) {
        // Fail closed: a broken limiter must not silently disable throttling.
        console.error("[rateLimit] check failed, refusing request:", key, error);
        return false;
    }
};

// Shared by every path that checks a password, so no path is unlimited.
export const loginAttemptAllowed = async (email: string, ip: string) =>
    await rateLimit(`login:email:${email.toLowerCase()}`, 10, 15 * 60) &&
    await rateLimit(`login:ip:${ip}`, 50, 15 * 60);

// Client address as set by Vercel, which overwrites x-forwarded-for.
export const clientIp = (headers: Headers) =>
    headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
