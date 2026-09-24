import { db } from "@/lib/db";

export const getPendingOrdersForUser = async (userid: string) => {
    try {
        const orders = await db.order.findMany({ where: { userId: userid, status: "PENDING"}, orderBy: { date: "desc" } });
        return orders;
    } catch {
        return null
    }
}

export const getOrdersForUser = async (userId: string) => {
    try {
        // Chronological and without cancelled orders: the achievement checks
        // compare adjacent orders.
        const dates = await db.order.findMany({
            select: {date: true, itemid: true, itemname: true},
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
            _sum: { priceCents: true },
            where: { status: "PENDING" }
        });
        return money._sum.priceCents ?? 0;
    } catch {
        return null;
    }
}

export const getTotalMoneyCompleted = async () => {
    try {
        const money = await db.order.aggregate({
            _sum: { priceCents: true },
            where: { status: "COMPLETED" }
        });
        return money._sum.priceCents ?? 0;
    } catch {
        return null;
    }
}
export type OrderTotals = { pendingCount: number; pendingCents: number; completedCount: number; completedCents: number };

// Pending and completed order counts and sums for every user, in one query.
export const getOrderTotalsByUser = async () => {
    try {
        const groups = await db.order.groupBy({
            by: ["userId", "status"],
            where: { status: { in: ["PENDING", "COMPLETED"] } },
            _count: { _all: true },
            _sum: { priceCents: true },
        });
        const totals = new Map<string, OrderTotals>();
        for (const group of groups) {
            const entry = totals.get(group.userId) ?? { pendingCount: 0, pendingCents: 0, completedCount: 0, completedCents: 0 };
            if (group.status === "PENDING") {
                entry.pendingCount = group._count._all;
                entry.pendingCents = group._sum.priceCents ?? 0;
            } else {
                entry.completedCount = group._count._all;
                entry.completedCents = group._sum.priceCents ?? 0;
            }
            totals.set(group.userId, entry);
        }
        return totals;
    } catch {
        return null;
    }
}

// Pending order ids and their total per user, for recording payments.
export const getPendingOrdersByUser = async () => {
    try {
        const orders = await db.order.findMany({
            where: { status: "PENDING" },
            select: { orderId: true, userId: true, priceCents: true },
        });
        const byUser = new Map<string, { orderIds: string[]; cents: number }>();
        for (const order of orders) {
            const entry = byUser.get(order.userId) ?? { orderIds: [], cents: 0 };
            entry.orderIds.push(order.orderId);
            entry.cents += order.priceCents;
            byUser.set(order.userId, entry);
        }
        return byUser;
    } catch {
        return null;
    }
}

export const getRecentPayments = async (take = 20) => {
    try {
        return await db.payment.findMany({
            orderBy: { createdAt: "desc" },
            take,
            select: {
                id: true,
                amountCents: true,
                ordersCents: true,
                reference: true,
                createdAt: true,
                user: { select: { name: true } },
                confirmedBy: { select: { name: true } },
                _count: { select: { orders: true } },
            },
        });
    } catch {
        return null;
    }
}
