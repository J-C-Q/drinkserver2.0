"use server";

import {db} from "@/lib/db";

import {getItemByName} from "@/data/item";
import { currentAdmin } from "@/lib/auth-guard";


export const item = async (itemname:string,itemprice:number,quantity:number) => {

    if(!(await currentAdmin())) {
        return {error: "You are not authorized to perform this action!", code: 403};
    }

    const existingItem = await getItemByName(itemname);

    if(!existingItem) {
        await db.item.create({
            data: {
                itemname,
                itemprice,
                quantity
            }
        });
        return {success: "Item added!", code: 200};
    }

    await db.item.update({
        where: {itemname: itemname},
        data: {quantity, itemprice}
    });

    return {success: "Item updated!", code: 200};
};