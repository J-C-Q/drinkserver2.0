import { db } from "@/lib/db";

export const getItemById = async (itemid: string) => {
    try {
        const item = await db.item.findUnique({ where: { itemid } });
        return item;
    } catch {
        return null
    }
}

export const getItemByName = async (itemname: string) => {
    try {
        const item = await db.item.findUnique({ where: { itemname } });
        return item;
    } catch {
        return null
    }
}

export const getItemQuantity = async (itemid: string) => {
    try {
        const item = await db.item.findUnique({ where: { itemid } });
        return item?.quantity;
    } catch {
        return null
    }
}

export const getItems = async () => {
    try {
        const items = await db.item.findMany();
        return items;
    } catch {
        return null
    }
}

