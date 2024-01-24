"use server";

import {db} from "@/lib/db";

import {getItemById} from "@/data/item";


export const Order = async (itemid:string,userid:string) => {
    
    const existingItem = await getItemById(itemid);

    if(!existingItem) {
        return {error: "Item not found!"};
    }

    if(existingItem.quantity < 1) {
        return {error: "Item out of stock!"};
    }

    await db.order.create({
        data: {
            itemid,
            userId: userid,
            itemname: existingItem.itemname,
            itemprice: existingItem.itemprice,
            date: new Date(),
            status: "PENDING"
        }
    });

    await db.item.update({
        where: {itemid: itemid},
        data: {quantity: existingItem.quantity - 1}
    });

    return {success: "Order placed!"};
};