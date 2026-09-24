import { db } from "@/lib/db";

export const getPendingOrdersForUser = async (userid: string) => {
    try {
        const orders = await db.order.findMany({ where: { userId: userid, status: "PENDING"}, orderBy: { date: "desc" } });
        return orders;
    } catch {
        return null
    }
}

export const verifyPendingOrdersForUser = async (userid: string) => {
    // An undefined userId would drop the filter and complete every user's orders.
    if (typeof userid !== "string" || userid === "") {
        return false;
    }
    try {
        await db.order.updateMany({ where: { userId: userid, status: "PENDING"}, data: { status: "COMPLETED" } });
        return true;
    } catch {
        return false
    }
}

export const getOrdersForUser = async (userId: string) => {
    try {
        // Chronological and without cancelled orders: the achievement checks
        // compare adjacent orders.
        const dates = await db.order.findMany({
            select: {date: true, itemname: true},
            where: {userId, status: {not: "CANCELLED"}},
            orderBy: {date: "asc"},
        });
        return dates;
    } catch {
        return null
    }
}

export const getTotalMoneyPending = async () => {
    try {
        const money = await db.order.aggregate({
            _sum: { itemprice: true },
            where: { status: "PENDING" }
        });
        return money._sum.itemprice;
    } catch {
        return null;
    }
}

export const getTotalMoneyCompleted = async () => {
    try {
        const money = await db.order.aggregate({
            _sum: { itemprice: true },
            where: { status: "COMPLETED" }
        });
        return money._sum.itemprice;
    } catch {
        return null;
    }
}
export type OrderTotals = { pendingCount: number; pendingAmount: number; completedCount: number; completedAmount: number };

// Pending and completed order counts and sums for every user, in one query.
export const getOrderTotalsByUser = async () => {
    try {
        const groups = await db.order.groupBy({
            by: ["userId", "status"],
            where: { status: { in: ["PENDING", "COMPLETED"] } },
            _count: { _all: true },
            _sum: { itemprice: true },
        });
        const totals = new Map<string, OrderTotals>();
        for (const group of groups) {
            const entry = totals.get(group.userId) ?? { pendingCount: 0, pendingAmount: 0, completedCount: 0, completedAmount: 0 };
            if (group.status === "PENDING") {
                entry.pendingCount = group._count._all;
                entry.pendingAmount = group._sum.itemprice ?? 0;
            } else {
                entry.completedCount = group._count._all;
                entry.completedAmount = group._sum.itemprice ?? 0;
            }
            totals.set(group.userId, entry);
        }
        return totals;
    } catch {
        return null;
    }
}
