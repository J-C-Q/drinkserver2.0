import { db } from "@/lib/db";

export const getAllAchievements = async () => {
    try {
        const achievements = await db.achievement.findMany();
        return achievements;
    } catch {
        return null
    }
}

// null means the read failed (or the user does not exist), not "none".
export const getAchievementsOfUser = async (userid: string) => {
    try {
        const achievementIDs = await db.user.findUnique({ where: { id: userid }, select: { achievements: true } });
        if (achievementIDs == null) {
            return null;
        }
        const achievements = await db.achievement.findMany({ where: { id: { in: achievementIDs.achievements } } });
        return achievements;
    } catch {
        return null
    }
}

export const getAchievementsUserDoesntHave = async (userid: string) => {
    try {
        const achievementIDs = await db.user.findUnique({ where: { id: userid }, select: { achievements: true } });
        if (achievementIDs == null) {
            return null;
        }
        const achievements = await db.achievement.findMany({ where: { id: { notIn: achievementIDs.achievements } } });
        return achievements;
    } catch {
        return null
    }
}

export const addAchievementToUser = async (userid: string, achievementid: string) => {
    try {
        await db.user.update({ where: { id: userid }, data: { achievements: { push: achievementid } } });
        return true;
    } catch {
        return false
    }
}