"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import {db} from "@/lib/db";
import { awardAchievements } from "@/lib/achievements";

import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth-guard";


type OrderResult = {success?: string; error?: string; code: number};

// The ordering user is always taken from the server session, never from the caller.
export const order = async (itemid:string): Promise<OrderResult> => {

    if(typeof itemid !== "string" || itemid === "") {
        return {error: "Item not found!", code: 404};
    }

    const sessionUser = await currentUser();

    if(!sessionUser) {
        return {error: "Not logged in!", code: 401};
    }

    const existingUser = await getUserById(sessionUser.id);

    if(!existingUser) {
        return {error: "User not found!", code: 404};
    }

    if(existingUser.authorized != true) {
        return {error: "Your are not authorized yet, please contact the admin", code: 403};
    }

    let result: OrderResult;
    try {
        result = await db.$transaction(async (tx): Promise<OrderResult> => {
            // Conditional decrement: only succeeds while stock is left, so
            // concurrent purchases of the last item cannot both go through.
            const decremented = await tx.item.updateMany({
                where: {itemid, quantity: {gt: 0}},
                data: {quantity: {decrement: 1}}
            });

            const existingItem = await tx.item.findUnique({where: {itemid}});

            if(!existingItem) {
                return {error: "Item not found!", code: 404};
            }

            if(decremented.count === 0) {
                return {error: `${existingItem.itemname} is out of stock!`, code: 400};
            }

            await tx.order.create({
                data: {
                    itemid,
                    userId: existingUser.id,
                    username: existingUser.name!=null?existingUser.name:"",
                    itemname: existingItem.itemname,
                    priceCents: existingItem.priceCents,
                    sugar: existingItem.sugar,
                    caffeine: existingItem.caffeine,
                    date: new Date(),
                    status: "PENDING"
                }
            });

            return {success: `${existingUser.name} ordered ${existingItem.itemname}!`, code: 200};
        });
    } catch {
        return {error: "Order failed, please try again", code: 500};
    }

    if(result.success) {
        // Awarded after the response is sent, so the purchase does not wait
        // for a full-history scan. A failure is retried with the next order.
        const userId = existingUser.id;
        after(async () => {
            try {
                await awardAchievements(userId);
            } catch (error) {
                console.error("[achievements] award failed for", userId, error);
            }
        });
        revalidatePath("/drinks");
        revalidatePath("/dashboard");
        revalidatePath("/stats");
    }

    return result;
};
