"use server";

import { revalidatePath } from "next/cache";

import {verifyPendingOrdersForUser} from "@/data/order";
import { currentAdmin } from "@/lib/auth-guard";

export const clearPendingOrders = async (userid: string) => {
    const admin = await currentAdmin();
    if (!admin) {
        return {error: "You are not authorized to perform this action!", code: 403};
    }

    const result = await verifyPendingOrdersForUser(userid);
    if (!result) {
        return {error: "Failed to clear pending orders", code: 500};
    }

    revalidatePath("/admin");
    return {success: "Pending orders cleared successfully", code: 200};
};
