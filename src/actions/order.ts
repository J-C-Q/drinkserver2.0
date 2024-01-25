"use server";

import {db} from "@/lib/db";

import {getItemById} from "@/data/item";
import { getUserById } from "@/data/user";


export const order = async (itemid:string,userid:string) => {
    
    const existingItem = await getItemById(itemid);
    const existingUser = await getUserById(userid);

    if(!existingUser) {
        return {error: "User not found!"};
    }

    if(existingUser.authorized != true) {
        return {error: "Your are not authorized yet, please contact the admin"};
    }

    if(!existingItem) {
        return {error: "Item not found!"};
    }

    if(existingItem.quantity < 1) {
        return {error: `${existingItem.itemname} is out of stock!`};
    }

    await db.order.create({
        data: {
            itemid,
            userId: userid,
            username: existingUser.name!=null?existingUser.name:"",
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

    return {success: `${existingUser.name} ordered ${existingItem.itemname}!`};
};