import { db } from "@/lib/db";

export const getPendingOrdersForUser = async (userid: string | undefined) => {
    try {
        const orders = await db.order.findMany({ where: { userId: userid, status: "PENDING"}, orderBy: { date: "desc" } });
        return orders;
    } catch {
        return null
    }
}

export const verifyPendingOrdersForUser = async (userid: string | undefined) => {
    try {
        await db.order.updateMany({ where: { userId: userid, status: "PENDING"}, data: { status: "COMPLETED" } });
        return true;
    } catch {
        return false
    }
}