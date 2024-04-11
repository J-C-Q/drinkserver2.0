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
        case "Regular":
            return checkRegular(orders);
        case "Loyal":
            return checkLoyal(orders);
        case "Explorer":
            return checkExplorer(orders,items);
        case "Mate Mate Mate":
            return checkMateMateMate(orders);
        case "Fritz":
            return checkFritz(orders);
        case "Frit":
            return checkFrit(orders);
        case "Philanthropist":
            return checkPhilanthropist(orders);
        case "Ahoj":
            return checkAhoj(orders);
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

function checkExplorer(orders: Order[], items: Item[]) {
    
    const uniqueItemNames = new Set(orders.map(order => order.itemname));
    const numberOfUniqueItems = uniqueItemNames.size;
    if (numberOfUniqueItems==items.length){
        return true
    }
    return false
}

function checkMateMateMate(orders: Order[]) {
    return checkMoreInAWeek(orders,"Mate Mate")
}

function checkFritz(orders: Order[]){
    return checkMoreInAWeek(orders,"Fritz Kola")
}

function checkFrit(orders: Order[]) {
    return checkMoreInAWeek(orders,"Fritz Kola Zuckerfrei")
}

function checkAhoj(orders: Order[]) {
    return checkMoreInAWeek(orders,"Fassbrause Zitrone")
}

function checkPhilanthropist(orders: Order[]) {
    return checkMoreInAWeek(orders,"ChariTea Mate")
}

function checkMoreInAWeek(orders: Order[], itemname:string){
    let drinkThisWeek = 0;
    let notDrinkThisWeek = 0;
    let currentWeek = getWeek(orders[0].date);
    for (let order of orders){
        if (currentWeek==getWeek(order.date)){
            if (order.itemname == itemname) {
                drinkThisWeek += 1;
            } else {
                notDrinkThisWeek +=1;
            }
        } else {
            if (drinkThisWeek > notDrinkThisWeek && (drinkThisWeek+notDrinkThisWeek >= 5)) {
                return true
            }
            if (order.itemname == itemname) {
                drinkThisWeek = 1;
                notDrinkThisWeek = 0
            } else {
                notDrinkThisWeek =1;
                drinkThisWeek = 0
            }
            currentWeek = getWeek(order.date)
        }
    }
    return false
}


function getWeek(date:Date) {
    /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

        let dowOffset = 1; //default dowOffset to zero
        var newYear = new Date(date.getFullYear(),0,1);
        var day = newYear.getDay() - dowOffset; //the day of week the year begins on
        day = (day >= 0 ? day : day + 7);
        var daynum = Math.floor((date.getTime() - newYear.getTime() - 
        (date.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
        var weeknum;
        //if the year starts before the middle of a week
        if(day < 4) {
            weeknum = Math.floor((daynum+day-1)/7) + 1;
            if(weeknum > 52) {
                let nYear = new Date(date.getFullYear() + 1,0,1);
                let nday = nYear.getDay() - dowOffset;
                nday = nday >= 0 ? nday : nday + 7;
                /*if the next year starts before the middle of
                  the week, it is week #1 of that year*/
                weeknum = nday < 4 ? 1 : 53;
            }
        }
        else {
            weeknum = Math.floor((daynum+day-1)/7);
        }
        return weeknum;
    };
    
