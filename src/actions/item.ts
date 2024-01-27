"use server";

import {db} from "@/lib/db";

import {getItemByName} from "@/data/item";


export const item = async (itemname:string,itemprice:number,quantity:number) => {
    
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