import { db } from "@/lib/db";
export const getTotalSugarAndCaffeinOfUser = async (userId: string | undefined) => {
    try {
       const drinks = await db.order.findMany({ where: { userId } });
       const items = await db.item.findMany({ where: { itemid: { in: drinks.map((drink) => drink.itemid) } } });
       const itemCounts = drinks.reduce((acc, order) => {
            // Check if the itemId exists in the accumulator object
            if (acc[order.itemid]) {
                acc[order.itemid]++; // Increment the count
            } else {
                acc[order.itemid] = 1; // Initialize the count
            }
            return acc;
            }, {} as Record<string, number>); // Initialize the accumulator as an object
        var totalSugar = 0;
        var totalCaffeine = 0;
        for (const item of items) {
            if (itemCounts[item.itemid] ) {
                if(item.sugar) {
               totalSugar += itemCounts[item.itemid] * item.sugar
                }
                if(item.caffeine) {
                    totalCaffeine += itemCounts[item.itemid] * item.caffeine
                }
            }
        }
        
        return { totalSugar, totalCaffeine };

    } catch {
        return null
    }
}