"use server";

import {db} from "@/lib/db";

import {verifyPendingOrdersForUser} from "@/data/order";

export const clearPendingOrders = async (userid: string) => {
    const result = await verifyPendingOrdersForUser(userid);
    return result;
};
