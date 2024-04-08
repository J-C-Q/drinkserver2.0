"use server";

import { getOrdersForUser } from "@/data/order";
import { addAchievementToUser, getAllAchievements } from "@/data/achievements";
import { getAchievementsOfUser } from "@/data/achievements";

type Achievement = {
    id: string;
    name: string;
    description: string;
    rarity: string;
    image: string;
}

export const updateAchievements = async (userid: string | undefined) => {

    const orders = await getOrdersForUser(userid);
    const possibleAchievements = await getAllAchievements();
    const achievements = await getAchievementsOfUser(userid)
    const achievementIds = achievements.map((achievement: Achievement) => achievement.id);

    if (orders == null || possibleAchievements == null || achievements == null) {
        return { error: "Error while fetching data", code: 500 };
    }

    for (let achievement in possibleAchievements) {
        // if(!(achievements.includes(possibleAchievements[achievement]))) {
        // check if the user has the required orders	
        if (!(achievementIds.includes(possibleAchievements[achievement].id))) {
            if (checkAchievement(orders, possibleAchievements[achievement].name)) {
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

function checkAchievement(orders: Order[], achievementName: string) {
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
            orders[i].date.getDay() == lastOrder.date.getDay() &&
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
