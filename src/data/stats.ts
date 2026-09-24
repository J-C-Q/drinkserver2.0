import { db } from "@/lib/db";
import { oneMonthEarlier, startOfBerlinDay } from "@/lib/berlin-time";

type SugarAndCaffeine = { sugar: number; caffeine: number };

// Sums sugar and caffeine in the database for the time windows shown on the
// stats page, using the values stored on each order at purchase time.
// "Today" is the Berlin calendar day; week and month are the rolling last
// 7 days and last calendar month.
export const getSugarAndCaffeinStatsOfUser = async (userId: string) => {
    try {
        const now = new Date();
        const sumSince = async (since?: Date): Promise<SugarAndCaffeine> => {
            const result = await db.order.aggregate({
                where: { userId, status: { not: "CANCELLED" }, ...(since ? { date: { gte: since } } : {}) },
                _sum: { sugar: true, caffeine: true },
            });
            return { sugar: result._sum.sugar ?? 0, caffeine: result._sum.caffeine ?? 0 };
        };

        const [total, today, lastWeek, lastMonth] = await Promise.all([
            sumSince(),
            sumSince(startOfBerlinDay(now)),
            sumSince(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
            sumSince(oneMonthEarlier(now)),
        ]);
        return { total, today, lastWeek, lastMonth };
    } catch (error) {
        console.error("[stats] could not load nutrition stats:", error);
        return null;
    }
};

// Number of orders per Berlin weekday (0 = Sunday) and hour, counted in the
// database instead of loading the whole history.
export const getOrderHeatmapOfUser = async (userId: string) => {
    try {
        // "date" holds UTC; the first AT TIME ZONE marks it as UTC, the second
        // converts to Berlin wall-clock time, independent of the session's
        // time zone.
        return await db.$queryRaw<{ dow: number; hour: number; count: number }[]>`
            SELECT EXTRACT(DOW FROM berlin)::int AS dow, EXTRACT(HOUR FROM berlin)::int AS hour, COUNT(*)::int AS count
            FROM (
                SELECT ("date" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Berlin' AS berlin
                FROM "Order"
                WHERE "userId" = ${userId} AND "status" <> 'CANCELLED'
            ) AS orders
            GROUP BY 1, 2`;
    } catch (error) {
        console.error("[stats] could not load heatmap:", error);
        return null;
    }
};
