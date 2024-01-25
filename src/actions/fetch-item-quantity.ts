"use server";

import {db} from "@/lib/db";

import {getItemById} from "@/data/item";


export const fetchItemQuantity = async (itemid:string) => {
    
    const existingItem = await getItemById(itemid);

    if(!existingItem) {
        return {error: "Item not found!"};
    }

    return {quantity: existingItem.quantity};
};