import { db } from "@/lib/db";

export const getPendingOrdersForUser = async (userid: string) => {
    try {
        const orders = await db.order.findMany({ where: { userId: userid, status: "PENDING"}, orderBy: { date: "desc" } });
        return orders;
    } catch {
        return null
    }
}

export const getCompletedOrdersForUser = async (userid: string) => {
    try {
        const orders = await db.order.findMany({ where: { userId: userid, status: "COMPLETED"}, orderBy: { date: "desc" } });
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
        const dates = await db.order.findMany({select: {date: true, itemname: true}, where: {userId}});
        return dates;
    } catch {
        return null
    }
}

export const getMoneySpendForUser = async (userId: string) => {
    try {
        const money = await db.order.aggregate({
            _sum: { itemprice: true },
            where: { userId }
        });
        return money._sum.itemprice;
    } catch {
        return null;
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