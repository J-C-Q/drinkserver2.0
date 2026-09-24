"use server";

import { getOrdersForUser } from "@/data/order";
import { addAchievementToUser, getAllAchievements } from "@/data/achievements";
import { getAchievementsOfUser } from "@/data/achievements";
import { Achievement, Item } from '@prisma/client'
import { getAllItems } from "@/data/item";
import { currentUser } from "@/lib/auth-guard";

// Always updates the session user's achievements.
export const updateAchievements = async () => {
    const user = await currentUser();
    if (!user) {
        return { error: "Not logged in!", code: 401 };
    }
    const userid = user.id;

    const orders = await getOrdersForUser(userid);
    const items = await getAllItems();
    const possibleAchievements = await getAllAchievements();
    const achievements = await getAchievementsOfUser(userid)


    if (orders == null || items == null || possibleAchievements == null || achievements == null) {
        return { error: "Error while fetching data", code: 500 };
    }
    const achievementIds = achievements.map((achievement: Achievement) => achievement.id);
    for (let achievement in possibleAchievements) {
        // if(!(achievements.includes(possibleAchievements[achievement]))) {
        // check if the user has the required orders	
        if (!(achievementIds.includes(possibleAchievements[achievement].id))) {
            if (checkAchievement(orders, items, possibleAchievements[achievement].name)) {
                // add the achievement to the user
                await addAchievementToUser(userid, possibleAchievements[achievement].id);
            }
        }
    }
}

// define a type for the orders
type Order = {
    date: Date;
    itemid: string;
    itemname: string;
}

function checkAchievement(orders: Order[], items: Item[], achievementName: string) {
    switch (achievementName) {
        case "First Drink":
            return checkFirstDrink(orders);
        case "Night Owl":
            return checkNightOwl(orders);
        case "Early Bird":
            return checkEarlyBird(orders);
        case "Weekend Warrior":
            return checkWeekendWarrior(orders);
        case "Thirsty":
            return checkThirsty(orders);
        case "Junkie":
            return checkJunkie(orders);
        case "Caffein Bomb":
            return checkCaffeinBomb(orders, items);
        case "Caffein Overdose":
            return checkCaffeinOverdose(orders,items);
        case "Sugar Shock":
            return checkSugarShock(orders, items);
        case "Regular":
            return checkRegular(orders);
        case "Loyal":
            return checkLoyal(orders);
        case "Explorer":
            return checkExplorer(orders,items);
        case "Mate Mate Mate":
            return checkMateMateMate(orders, items);
        case "Fritz":
            return checkFritz(orders, items);
        case "Frit":
            return checkFrit(orders, items);
        case "Philanthropist":
            return checkPhilanthropist(orders, items);
        case "Ahoj":
            return checkAhoj(orders, items);
    }
}

// define the functions to check the achievements
function checkFirstDrink(orders: Order[]) {
    return orders.length > 0;
}

function checkRegular(orders: Order[]){
    return orders.length >= 20;
}
function checkLoyal(orders: Order[]){
    return orders.length >= 100;
}


function checkNightOwl(orders: Order[]) {
    for (let order of orders) {
        if ((parseInt(order.date.toLocaleString("de-DE", {
            hour: "2-digit",
            timeZone: "Europe/Berlin"}))>= 23) || ((parseInt(order.date.toLocaleString("de-DE", {
                hour: "2-digit",
                timeZone: "Europe/Berlin"})) <= 4))) {
            return true;
        }
    }
    return false;
}

function checkEarlyBird(orders: Order[]) {
    for (let order of orders) {
        if ((parseInt(order.date.toLocaleString("de-DE", {
            hour: "2-digit",
            timeZone: "Europe/Berlin"})) >= 6) && parseInt(order.date.toLocaleString("de-DE", {
                hour: "2-digit",
                timeZone: "Europe/Berlin"})) <= 7) {
            return true;
        }
    }
    return false;
}

function checkWeekendWarrior(orders: Order[]) {
    for (let order of orders) {
        const weekday = order.date.toLocaleDateString("en-US", { weekday: "short", timeZone: "Europe/Berlin" });
        if (weekday == "Sat" || weekday == "Sun") {
            return true;
        }
    }
    return false;
}


function checkNDrinksADay(orders: Order[], N: number) {
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


function checkThirsty(orders: Order[]) {
    return checkNDrinksADay(orders, 3);
}

function checkJunkie(orders: Order[]) {
    return checkNDrinksADay(orders, 5);
}

function checkCaffeinBomb(orders: Order[], items: Item[]) {
    return exceedsDailyTotal(orders, items, "caffeine", 200);
}

function checkCaffeinOverdose(orders: Order[], items: Item[]) {
    return exceedsDailyTotal(orders, items, "caffeine", 400);
}

function checkSugarShock(orders: Order[], items: Item[]) {
    return exceedsDailyTotal(orders, items, "sugar", 50);
}

// True if on any Berlin calendar day the drinks add up to at least threshold,
// including a single drink that reaches it on its own.
function exceedsDailyTotal(orders: Order[], items: Item[], field: "caffeine" | "sugar", threshold: number) {
    // By id, not name: drinks get renamed, orders keep the old name.
    const amountById: Map<string, number> = new Map();
    for (let item of items) {
        amountById.set(item.itemid, item[field] ?? 0);
    }

    const totalPerDay: Map<string, number> = new Map();
    for (let order of orders) {
        const day = berlinDay(order.date);
        const total = (totalPerDay.get(day) ?? 0) + (amountById.get(order.itemid) ?? 0);
        if (total >= threshold) {
            return true;
        }
        totalPerDay.set(day, total);
    }
    return false;
}

function checkExplorer(orders: Order[], items: Item[]) {
    // Every drink currently on offer has been ordered at least once.
    const orderedIds = new Set(orders.map(order => order.itemid));
    const available = items.filter(item => item.quantity > 0);
    return available.length > 0 && available.every(item => orderedIds.has(item.itemid));
}

function checkMateMateMate(orders: Order[], items: Item[]) {
    return checkMoreInAWeek(orders, items, "Mate Mate")
}

function checkFritz(orders: Order[], items: Item[]) {
    return checkMoreInAWeek(orders, items, "Fritz Kola")
}

function checkFrit(orders: Order[], items: Item[]) {
    return checkMoreInAWeek(orders, items, "Fritz Kola Zuckerfrei")
}

function checkAhoj(orders: Order[], items: Item[]) {
    return checkMoreInAWeek(orders, items, "Fassbrause Zitrone")
}

function checkPhilanthropist(orders: Order[], items: Item[]) {
    return checkMoreInAWeek(orders, items, "ChariTea Mate")
}

function checkMoreInAWeek(orders: Order[], items: Item[], itemname:string){
    if (orders.length == 0) {
        return false;
    }
    // Compare against the drink's current name, so orders placed before a
    // rename still count.
    const currentName: Map<string, string> = new Map(items.map(item => [item.itemid, item.itemname]));
    const nameOf = (order: Order) => currentName.get(order.itemid) ?? order.itemname;
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


// Calendar day in Berlin as YYYY-MM-DD, independent of the server's time zone.
function berlinDay(date: Date) {
    return date.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

// Monday of the Berlin calendar week as YYYY-MM-DD, so weeks of different
// years never compare equal.
function berlinWeek(date: Date) {
    const day = new Date(berlinDay(date) + "T00:00:00Z");
    day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
    return day.toISOString().slice(0, 10);
}
