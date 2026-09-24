import { db } from "@/lib/db";

type SugarAndCaffeine = { sugar: number; caffeine: number };

// Loads the user's non-cancelled orders once and sums sugar and caffeine for
// all time windows shown on the stats page.
export const getSugarAndCaffeinStatsOfUser = async (userId: string) => {
    try {
        const orders = await db.order.findMany({
            where: { userId, status: { not: "CANCELLED" } },
            select: { itemid: true, date: true },
        });
        const items = await db.item.findMany({
            where: { itemid: { in: Array.from(new Set(orders.map((order) => order.itemid))) } },
            select: { itemid: true, sugar: true, caffeine: true },
        });
        const itemsById = new Map(items.map((item) => [item.itemid, item]));

        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
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
                const item = itemsById.get(order.itemid);
                sugar += item?.sugar ?? 0;
                caffeine += item?.caffeine ?? 0;
            }
            return { sugar, caffeine };
        };

        return {
            total: sumSince(),
            today: sumSince(startOfToday),
            lastWeek: sumSince(lastWeek),
            lastMonth: sumSince(lastMonth),
        };
    } catch {
        return null;
    }
};
