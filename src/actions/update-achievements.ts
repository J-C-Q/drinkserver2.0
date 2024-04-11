"use server";

import { getOrdersForUser } from "@/data/order";
import { addAchievementToUser, getAllAchievements } from "@/data/achievements";
import { getAchievementsOfUser } from "@/data/achievements";
import { Achievement, Item } from '@prisma/client'
import { getItems } from "@/data/item";

export const updateAchievements = async (userid: string | undefined) => {

    const orders = await getOrdersForUser(userid);
    const items = await getItems();
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
        case "Sugar Shock":
            return checkSugarShock(orders, items);
    }
}

// define the functions to check the achievements
function checkFirstDrink(orders: Order[]) {
    return orders.length > 0;
}

function checkNightOwl(orders: Order[]) {
    let count = 0;
    for (let order of orders) {
        if (order.date.getHours() >= 23 && order.date.getHours() <= 4) {
            return true;
        }
    }
    return false;
}

function checkEarlyBird(orders: Order[]) {
    let count = 0;
    for (let order of orders) {
        if (order.date.getHours() >= 6 && order.date.getHours() <= 8) {
            return true;
        }
    }
    return false;
}

function checkWeekendWarrior(orders: Order[]) {
    for (let order of orders) {
        if (order.date.getDay() == 0 || order.date.getDay() == 6) {
            return true;
        }
    }
    return false;
}


function checkNDrinksADay(orders: Order[], N: number) {

    if (orders.length == 0) {
        return false;
    }
    let count = 1;
    let lastOrder = orders[0];
    // for loop starting from the second order
    for (let i = 1; i < orders.length; i++) {
        if (
            orders[i].date.getDate() == lastOrder.date.getDate() &&
            orders[i].date.getMonth() == lastOrder.date.getMonth() &&
            orders[i].date.getFullYear() == lastOrder.date.getFullYear()
        ) {
            count++;
            if (count >= N) {
                return true;
            }
        }
        else {
            count = 1;
            lastOrder = orders[i];
        }
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

    if (orders.length == 0) {
        return false;
    }

    // import caffeine values from the items db
    const indexMap: Map<string, number> = new Map();

    if (items) {
        for (let item of items) {
            indexMap.set(item.itemname, item.caffeine ?? 0);
        }
    } else {
        return false;
    }

    let caffeine = indexMap.get(orders[0].itemname) ?? 0;
    let lastOrder = orders[0];

    // for loop starting from the second order
    for (let i = 1; i < orders.length; i++) {
        if (
            orders[i].date.getDate() == lastOrder.date.getDate() &&
            orders[i].date.getMonth() == lastOrder.date.getMonth() &&
            orders[i].date.getFullYear() == lastOrder.date.getFullYear()
        ) {

            caffeine += indexMap.get(orders[i].itemname) ?? 0;
            if (caffeine >= 200) {
                return true;
            }
        }
        else {
            caffeine = indexMap.get(orders[i].itemname) ?? 0;
            lastOrder = orders[i];
        }
    }
    return false;
}

function checkSugarShock(orders: Order[], items: Item[]) {


    if (orders.length == 0) {
        return false;
    }

    // import sugar values from the items db
    const indexMap: Map<string, number> = new Map();

    if (items) {
        for (let item of items) {
            indexMap.set(item.itemname, item.sugar ?? 0);
        }
    } else {
        return false;
    }

    let sugar = indexMap.get(orders[0].itemname) ?? 0;
    let lastOrder = orders[0];

    // for loop starting from the second order
    for (let i = 1; i < orders.length; i++) {
        if (
            orders[i].date.getDate() == lastOrder.date.getDate() &&
            orders[i].date.getMonth() == lastOrder.date.getMonth() &&
            orders[i].date.getFullYear() == lastOrder.date.getFullYear()) {
            sugar += indexMap.get(orders[i].itemname) ?? 0;
            if (sugar >= 50) {
                return true;
            }
        }
        else {
            sugar = indexMap.get(orders[i].itemname) ?? 0;
            lastOrder = orders[i];
        }
    }
    return false;
}