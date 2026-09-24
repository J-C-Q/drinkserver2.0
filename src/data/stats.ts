import { db } from "@/lib/db";
import { startOfBerlinDay } from "@/lib/berlin-time";

type SugarAndCaffeine = { sugar: number; caffeine: number };

// Loads the user's non-cancelled orders once and sums sugar and caffeine for
// all time windows shown on the stats page, using the values stored on each
// order at purchase time. "Today" is the Berlin calendar day; week and month
// are the rolling last 7 days and last month.
export const getSugarAndCaffeinStatsOfUser = async (userId: string) => {
    try {
        const orders = await db.order.findMany({
            where: { userId, status: { not: "CANCELLED" } },
            select: { date: true, sugar: true, caffeine: true },
        });

        const now = new Date();
        const startOfToday = startOfBerlinDay(now);
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);

        const sumSince = (since?: Date): SugarAndCaffeine => {
            let sugar = 0;
            let caffeine = 0;
            for (const order of orders) {
                if (since && order.date < since) {
                    continue;
                }
                sugar += order.sugar ?? 0;
                caffeine += order.caffeine ?? 0;
            }
            return { sugar, caffeine };
        };

        return {
            total: sumSince(),
            today: sumSince(startOfToday),
            lastWeek: sumSince(lastWeek),
            lastMonth: sumSince(lastMonth),
        };
    } catch (error) {
        console.error("[stats] could not load nutrition stats:", error);
        return null;
    }
};
