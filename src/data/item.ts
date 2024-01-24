import { db } from "@/lib/db";

export const getItemById = async (itemid: string) => {
    try {
        const item = await db.item.findUnique({ where: { itemid } });
        return item;
    } catch {
        return null
    }
}

