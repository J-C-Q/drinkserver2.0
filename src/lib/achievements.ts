import { getOrdersForUser, getPaymentsForUser } from "@/data/order";
import { addAchievementToUser, getAllAchievements, hadHappyHour, isFirstToOrderADrink, wasTopOfAMonth } from "@/data/achievements";
import { getAchievementsOfUser } from "@/data/achievements";
import { Achievement } from '@prisma/client'
import { getAllItems } from "@/data/item";
import { checkAchievement } from "@/lib/achievement-rules";

// Awards every achievement the user's order history now qualifies for.
// Evaluated from the full history each time, so it is safe to repeat: it runs
// after each order and payment and daily for everyone
// (/api/cron/achievements), which catches awards whose first attempt failed.
// Not a server action: only called from server code with a user id the caller
// has already authenticated.
export const awardAchievements = async (userid: string) => {

    const possibleAchievements = await getAllAchievements();
    const achievements = await getAchievementsOfUser(userid)
    if (possibleAchievements == null || achievements == null) {
        throw new Error("could not load achievement data");
    }
    const achievementIds = achievements.map((achievement: Achievement) => achievement.id);
    const missing = possibleAchievements.filter((achievement) => !achievementIds.includes(achievement.id));
    // Nothing left to award: skip reading the order history.
    if (missing.length === 0) {
        return;
    }

    // The queries over everyone's orders only run while their achievement is missing.
    const needs = (name: string) => missing.some((achievement) => achievement.name === name);
    const [orders, items, payments, firstToOrder, happyHour, topOfMonth] = await Promise.all([
        getOrdersForUser(userid),
        getAllItems(),
        getPaymentsForUser(userid),
        needs("Trendsetter") ? isFirstToOrderADrink(userid) : undefined,
        needs("Happy Hour") ? hadHappyHour(userid) : undefined,
        needs("Top of the Month") ? wasTopOfAMonth(userid) : undefined,
    ]);
    if (orders == null || items == null || payments == null || firstToOrder === null || happyHour === null || topOfMonth === null) {
        throw new Error("could not load achievement data");
    }
    const data = { orders, items, payments, firstToOrder, happyHour, topOfMonth };
    for (const achievement of missing) {
        if (checkAchievement(achievement.name, data)) {
            if (!(await addAchievementToUser(userid, achievement.id))) {
                throw new Error(`could not save achievement ${achievement.name}`);
            }
        }
    }
}
