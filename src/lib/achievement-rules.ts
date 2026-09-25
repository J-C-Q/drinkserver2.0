import { berlinDay, berlinWeek } from "./berlin-time.ts";

// What each achievement is decided on. Pure, so the rules can be tested
// without a database; src/lib/achievements.ts loads the data.

// A user's orders, chronological and without cancelled ones: several rules
// compare adjacent orders.
export type AchievementOrder = {
    date: Date;
    itemid: string;
    itemname: string;
    priceCents: number;
    sugar: number | null;
    caffeine: number | null;
};

export type AchievementItem = {
    itemid: string;
    itemname: string;
    quantity: number;
    energy: number | null;
};

export type AchievementPayment = {
    amountCents: number;
    ordersCents: number;
    createdAt: Date;
    // The oldest order the payment settled.
    oldestOrderDate: Date | null;
};

export type AchievementData = {
    orders: AchievementOrder[];
    items: AchievementItem[];
    payments: AchievementPayment[];
    // Facts about other users' orders, computed in SQL. Left out when the
    // user already has the achievement.
    firstToOrder?: boolean;
    happyHour?: boolean;
    topOfMonth?: boolean;
};

const DAY = 24 * 60 * 60 * 1000;

const rules: Record<string, (data: AchievementData) => boolean> = {
    "First Drink": ({ orders }) => orders.length > 0,
    "Regular": ({ orders }) => orders.length >= 20,
    "Loyal": ({ orders }) => orders.length >= 100,
    "Stammgast": ({ orders }) => orders.length >= 250,
    "Legend": ({ orders }) => orders.length >= 500,
    "Night Owl": ({ orders }) => checkNightOwl(orders),
    "Early Bird": ({ orders }) => checkEarlyBird(orders),
    "Weekend Warrior": ({ orders }) => checkWeekendWarrior(orders),
    "Thirsty": ({ orders }) => checkNDrinksADay(orders, 3),
    "Junkie": ({ orders }) => checkNDrinksADay(orders, 5),
    "Caffein Bomb": ({ orders }) => exceedsDailyTotal(orders, "caffeine", 200),
    "Caffein Overdose": ({ orders }) => exceedsDailyTotal(orders, "caffeine", 400),
    "Sugar Shock": ({ orders }) => exceedsDailyTotal(orders, "sugar", 50),
    "Explorer": ({ orders, items }) => checkExplorer(orders, items),
    "Mate Mate Mate": ({ orders, items }) => checkMoreInAWeek(orders, items, "Mate Mate"),
    "Fritz": ({ orders, items }) => checkMoreInAWeek(orders, items, "Fritz Kola"),
    "Frit": ({ orders, items }) => checkMoreInAWeek(orders, items, "Fritz Kola Zuckerfrei"),
    "Ahoj": ({ orders, items }) => checkMoreInAWeek(orders, items, "Fassbrause Zitrone"),
    "Philanthropist": ({ orders, items }) => checkMoreInAWeek(orders, items, "ChariTea Mate"),

    "Anniversary": ({ orders }) =>
        orders.length > 0 && orders[orders.length - 1].date.getTime() - orders[0].date.getTime() >= 365 * DAY,
    "Comeback": ({ orders }) => orders.some((order, i) => i > 0 && order.date.getTime() - orders[i - 1].date.getTime() >= 30 * DAY),
    "Perfect Week": ({ orders }) => checkPerfectWeek(orders),
    "Iron Liver": ({ orders }) => longestWorkingDayStreak(orders) >= 20,
    "Full Calendar": ({ orders }) => new Set(orders.map((order) => berlinWeekday(order.date))).size === 7,
    "Lunch Break": ({ orders }) => orders.some((order) => berlinHour(order.date) === 12),
    "Feierabend": ({ orders }) => orders.some((order) => berlinWeekday(order.date) === 5 && berlinHour(order.date) >= 17),
    "Double Fisting": ({ orders }) => orders.some((order, i) => i > 0 && order.date.getTime() - orders[i - 1].date.getTime() <= 60_000),
    "Silent Night": ({ orders }) => orders.some((order) => ["12-24", "12-25", "12-26", "01-01"].includes(berlinDay(order.date).slice(5))),
    "Pi Day": ({ orders }) => orders.some((order) => berlinDay(order.date).slice(5) === "03-14"),
    "Friday the 13th": ({ orders }) => orders.some((order) => berlinDay(order.date).slice(8) === "13" && berlinWeekday(order.date) === 5),

    "Sommelier": ({ orders }) => new Set(orders.map((order) => order.itemid)).size >= 10,
    "Rainbow": ({ orders }) => maxPerGroup(orders, (order) => berlinDay(order.date), (group) => new Set(group.map((order) => order.itemid)).size) >= 4,
    "Creature of Habit": ({ orders }) => longestRun(orders) >= 15,
    "Brand Ambassador": ({ orders }) => maxPerGroup(orders, (order) => order.itemid, (group) => group.length) >= 50,

    "Sugar Mountain": ({ orders }) => sum(orders, (order) => order.sugar ?? 0) >= 1000,
    "Espresso Machine": ({ orders }) => sum(orders, (order) => order.caffeine ?? 0) >= 10000,
    // Drinks without nutrition data are not counted as water.
    "Hydrated": ({ orders }) => orders.filter((order) => order.sugar === 0 && order.caffeine === 0).length >= 10,
    "Clean Week": ({ orders }) => someGroup(orders, (order) => berlinWeek(order.date), (group) => group.length >= 5 && group.every((order) => order.sugar === 0)),
    "Decaf Day": ({ orders }) => someGroup(orders, (order) => berlinDay(order.date), (group) => group.length >= 3 && group.every((order) => order.caffeine === 0)),
    // Energy is not stored on the order, so this uses the drinks' current values.
    "Marathon": ({ orders, items }) => {
        const energy = new Map(items.map((item) => [item.itemid, item.energy ?? 0]));
        return sum(orders, (order) => energy.get(order.itemid) ?? 0) >= 2600;
    },

    "Big Spender": ({ orders }) => sum(orders, (order) => order.priceCents) >= 100_00,
    "Clean Slate": ({ payments }) => payments.length > 0,
    "Tip Jar": ({ payments }) => payments.some((payment) => payment.amountCents > payment.ordersCents),
    "Good Standing": ({ payments }) => payments.some((payment) =>
        payment.oldestOrderDate != null && payment.createdAt.getTime() - payment.oldestOrderDate.getTime() <= 7 * DAY),

    "Trendsetter": ({ firstToOrder }) => firstToOrder === true,
    "Happy Hour": ({ happyHour }) => happyHour === true,
    "Top of the Month": ({ topOfMonth }) => topOfMonth === true,
    // "Last One" (bought the last bottle in stock) is not in the history; the
    // order action awards it in the purchase transaction.
};

export const checkAchievement = (name: string, data: AchievementData) => rules[name]?.(data) ?? false;

// 0 (Sunday) to 6 (Saturday) on the Berlin calendar.
function berlinWeekday(date: Date) {
    return new Date(berlinDay(date) + "T00:00:00Z").getUTCDay();
}

// 0 to 23 on the Berlin clock.
function berlinHour(date: Date) {
    return Number(date.toLocaleString("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Europe/Berlin" }));
}

function sum(orders: AchievementOrder[], value: (order: AchievementOrder) => number) {
    return orders.reduce((total, order) => total + value(order), 0);
}

function groupBy(orders: AchievementOrder[], key: (order: AchievementOrder) => string) {
    const groups: Map<string, AchievementOrder[]> = new Map();
    for (const order of orders) {
        const k = key(order);
        const group = groups.get(k);
        if (group) {
            group.push(order);
        } else {
            groups.set(k, [order]);
        }
    }
    return [...groups.values()];
}

function someGroup(orders: AchievementOrder[], key: (order: AchievementOrder) => string, test: (group: AchievementOrder[]) => boolean) {
    return groupBy(orders, key).some(test);
}

function maxPerGroup(orders: AchievementOrder[], key: (order: AchievementOrder) => string, measure: (group: AchievementOrder[]) => number) {
    return Math.max(0, ...groupBy(orders, key).map(measure));
}

// Longest run of consecutive orders of the same drink.
function longestRun(orders: AchievementOrder[]) {
    let longest = 0;
    let run = 0;
    for (let i = 0; i < orders.length; i++) {
        run = i > 0 && orders[i].itemid === orders[i - 1].itemid ? run + 1 : 1;
        longest = Math.max(longest, run);
    }
    return longest;
}

function checkPerfectWeek(orders: AchievementOrder[]) {
    return someGroup(orders, (order) => berlinWeek(order.date), (week) => {
        const weekdays = new Set(week.map((order) => berlinWeekday(order.date)));
        return [1, 2, 3, 4, 5].every((day) => weekdays.has(day));
    });
}

// Longest run of Monday-to-Friday days with at least one order each, where
// weekends neither count nor break the run. Public holidays do break it.
function longestWorkingDayStreak(orders: AchievementOrder[]) {
    const days = [...new Set(orders.map((order) => berlinDay(order.date)))]
        .map((day) => new Date(day + "T00:00:00Z"))
        .filter((day) => day.getUTCDay() !== 0 && day.getUTCDay() !== 6);
    let longest = 0;
    let streak = 0;
    for (let i = 0; i < days.length; i++) {
        streak = i > 0 && nextWorkingDay(days[i - 1]).getTime() === days[i].getTime() ? streak + 1 : 1;
        longest = Math.max(longest, streak);
    }
    return longest;
}

function nextWorkingDay(day: Date) {
    const next = new Date(day.getTime() + DAY);
    while (next.getUTCDay() === 0 || next.getUTCDay() === 6) {
        next.setUTCDate(next.getUTCDate() + 1);
    }
    return next;
}

function checkNightOwl(orders: AchievementOrder[]) {
    return orders.some((order) => berlinHour(order.date) >= 23 || berlinHour(order.date) <= 4);
}

function checkEarlyBird(orders: AchievementOrder[]) {
    return orders.some((order) => berlinHour(order.date) >= 6 && berlinHour(order.date) <= 7);
}

function checkWeekendWarrior(orders: AchievementOrder[]) {
    return orders.some((order) => berlinWeekday(order.date) === 0 || berlinWeekday(order.date) === 6);
}

function checkNDrinksADay(orders: AchievementOrder[], N: number) {
    const drinksPerDay: Map<string, number> = new Map();
    for (let order of orders) {
        const day = berlinDay(order.date);
        const count = (drinksPerDay.get(day) ?? 0) + 1;
        if (count >= N) {
            return true;
        }
        drinksPerDay.set(day, count);
    }
    return false;
}

// True if on any Berlin calendar day the drinks add up to at least threshold,
// including a single drink that reaches it on its own. Uses the values stored
// on each order at purchase time.
function exceedsDailyTotal(orders: AchievementOrder[], field: "caffeine" | "sugar", threshold: number) {
    const totalPerDay: Map<string, number> = new Map();
    for (let order of orders) {
        const day = berlinDay(order.date);
        const total = (totalPerDay.get(day) ?? 0) + (order[field] ?? 0);
        if (total >= threshold) {
            return true;
        }
        totalPerDay.set(day, total);
    }
    return false;
}

function checkExplorer(orders: AchievementOrder[], items: AchievementItem[]) {
    // Every drink currently on offer has been ordered at least once.
    const orderedIds = new Set(orders.map(order => order.itemid));
    const available = items.filter(item => item.quantity > 0);
    return available.length > 0 && available.every(item => orderedIds.has(item.itemid));
}

function checkMoreInAWeek(orders: AchievementOrder[], items: AchievementItem[], itemname: string) {
    if (orders.length == 0) {
        return false;
    }
    // Compare against the drink's current name, so orders placed before a
    // rename still count.
    const currentName: Map<string, string> = new Map(items.map(item => [item.itemid, item.itemname]));
    const nameOf = (order: AchievementOrder) => currentName.get(order.itemid) ?? order.itemname;
    let drinkThisWeek = 0;
    let notDrinkThisWeek = 0;
    let currentWeek = berlinWeek(orders[0].date);
    for (let order of orders){
        if (currentWeek==berlinWeek(order.date)){
            if (nameOf(order) == itemname) {
                drinkThisWeek += 1;
            } else {
                notDrinkThisWeek +=1;
            }
            if (drinkThisWeek > notDrinkThisWeek && (drinkThisWeek+notDrinkThisWeek >= 5)) {
                return true
            }
        } else {
            if (drinkThisWeek > notDrinkThisWeek && (drinkThisWeek+notDrinkThisWeek >= 5)) {
                return true
            }
            if (nameOf(order) == itemname) {
                drinkThisWeek = 1;
                notDrinkThisWeek = 0
            } else {
                notDrinkThisWeek =1;
                drinkThisWeek = 0
            }
            currentWeek = berlinWeek(order.date)
        }

    }
    return false
}
