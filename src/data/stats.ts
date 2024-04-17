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

export const getTodaySugarAndCaffeinOfUser = async (userId: string | undefined) => {
    try {
        const drinks = await db.order.findMany({ where: { userId, date: { gte: new Date(new Date().setHours(0, 0, 0, 0))}}});
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
        var todaySugar = 0;
        var todayCaffeine = 0;
        for (const item of items) {
            if (itemCounts[item.itemid]) {
                if (item.sugar) {
                    todaySugar += itemCounts[item.itemid] * item.sugar
                }
                if (item.caffeine) {
                    todayCaffeine += itemCounts[item.itemid] * item.caffeine
                }
            }
        }
        return { todaySugar, todayCaffeine };
    } catch {
        return null
    }
}

export const getLastWeekSugarAndCaffeinOfUser = async (userId: string | undefined) => {
    try {
        const drinks = await db.order.findMany({ where: { userId, date: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } });
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
        var lastWeekSugar = 0;
        var lastWeekCaffeine = 0;
        for (const item of items) {
            if (itemCounts[item.itemid]) {
                if (item.sugar) {
                    lastWeekSugar += itemCounts[item.itemid] * item.sugar
                }
                if (item.caffeine) {
                    lastWeekCaffeine += itemCounts[item.itemid] * item.caffeine
                }
            }
        }
        return { lastWeekSugar, lastWeekCaffeine };
    } catch {
        return null
    }
}

export const getLastMonthSugarAndCaffeinOfUser = async (userId: string | undefined) => {
    try {
        const drinks = await db.order.findMany({ where: { userId, date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } } });
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
        var lastMonthSugar = 0;
        var lastMonthCaffeine = 0;
        for (const item of items) {
            if (itemCounts[item.itemid]) {
                if (item.sugar) {
                    lastMonthSugar += itemCounts[item.itemid] * item.sugar
                }
                if (item.caffeine) {
                    lastMonthCaffeine += itemCounts[item.itemid] * item.caffeine
                }
            }
        }
        return { lastMonthSugar, lastMonthCaffeine };
    } catch {
        return null
    }
}