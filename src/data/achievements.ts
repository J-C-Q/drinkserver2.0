import { db } from "@/lib/db";

export const getAllAchievements = async () => {
    try {
        const achievements = await db.achievement.findMany();
        return achievements;
    } catch {
        return null
    }
}

export const getAchievementsOfUser = async (userid: string | undefined) => {
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

export const addAchievementToUser = async (userid: string | undefined, achievementid: string | undefined) => {
    try {
        await db.user.update({ where: { id: userid }, data: { achievements: { push: achievementid } } });
        return true;
    } catch {
        return false
    }
}