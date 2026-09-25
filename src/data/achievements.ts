import { Prisma } from "@prisma/client";
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
        // One conditional statement, so concurrent award runs cannot both
        // append the same id.
        await db.$executeRaw`
            UPDATE "User"
            SET "achievements" = array_append("achievements", ${achievementid}::text)
            WHERE "id" = ${userid} AND NOT (${achievementid}::text = ANY("achievements"))`;
        return true;
    } catch {
        return false
    }
}
// Awards the achievement with this name inside the caller's transaction, for
// achievements that are decided at purchase time instead of from the history.
export const addAchievementToUserByName = async (tx: Prisma.TransactionClient, userid: string, name: string) => {
    await tx.$executeRaw`
        UPDATE "User"
        SET "achievements" = array_append("User"."achievements", a."id")
        FROM "Achievement" a
        WHERE a."name" = ${name} AND "User"."id" = ${userid} AND NOT (a."id" = ANY("User"."achievements"))`;
}

// The facts below compare the user's orders with everyone else's, so they are
// computed in the database. null means the read failed.

// The user placed the first order ever of some drink.
export const isFirstToOrderADrink = async (userid: string) => {
    try {
        const [row] = await db.$queryRaw<{ first: boolean }[]>`
            SELECT EXISTS (
                SELECT 1 FROM (
                    SELECT DISTINCT ON ("itemid") "userId"
                    FROM "Order"
                    WHERE "status" <> 'CANCELLED'
                    ORDER BY "itemid", "date", "orderId"
                ) AS firsts
                WHERE firsts."userId" = ${userid}
            ) AS first`;
        return row.first;
    } catch (error) {
        console.error("[achievements] could not check first orders:", error);
        return null;
    }
}

// At least three other people ordered within 10 minutes of one of the user's orders.
export const hadHappyHour = async (userid: string) => {
    try {
        const [row] = await db.$queryRaw<{ happy: boolean }[]>`
            SELECT EXISTS (
                SELECT 1
                FROM "Order" mine
                JOIN "Order" other
                    ON other."date" BETWEEN mine."date" - interval '10 minutes' AND mine."date" + interval '10 minutes'
                    AND other."userId" <> mine."userId" AND other."status" <> 'CANCELLED'
                WHERE mine."userId" = ${userid} AND mine."status" <> 'CANCELLED'
                GROUP BY mine."orderId"
                HAVING COUNT(DISTINCT other."userId") >= 3
            ) AS happy`;
        return row.happy;
    } catch (error) {
        console.error("[achievements] could not check happy hour:", error);
        return null;
    }
}

// The user ordered the most drinks of anyone (ties included) in some Berlin
// calendar month that has already ended.
export const wasTopOfAMonth = async (userid: string) => {
    try {
        // "date" holds UTC; see getOrderHeatmapOfUser for the time zone conversion.
        const [row] = await db.$queryRaw<{ top: boolean }[]>`
            WITH monthly AS (
                SELECT date_trunc('month', ("date" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Berlin') AS month, "userId", COUNT(*) AS drinks
                FROM "Order"
                WHERE "status" <> 'CANCELLED'
                GROUP BY 1, 2
            )
            SELECT EXISTS (
                SELECT 1 FROM monthly m
                WHERE m."userId" = ${userid}
                    AND m.month < date_trunc('month', now() AT TIME ZONE 'Europe/Berlin')
                    AND m.drinks = (SELECT MAX(drinks) FROM monthly x WHERE x.month = m.month)
            ) AS top`;
        return row.top;
    } catch (error) {
        console.error("[achievements] could not check monthly ranking:", error);
        return null;
    }
}
