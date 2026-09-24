import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { awardAchievements } from "@/lib/achievements";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const sameSecret = (given: string, expected: string) => {
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
};

// Daily reconciliation, scheduled in vercel.json: awards achievements whose
// after-purchase run failed. Vercel Cron calls it with GET and
// "Authorization: Bearer $CRON_SECRET"; without CRON_SECRET it refuses all
// requests. Repeating it is harmless, since awarding is idempotent.
export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (!secret || !sameSecret(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await db.user.findMany({ where: { orders: { some: {} } }, select: { id: true } });
    let failed = 0;
    for (const user of users) {
        try {
            await awardAchievements(user.id);
        } catch (error) {
            failed++;
            console.error("[cron/achievements] award failed for", user.id, error);
        }
    }
    return NextResponse.json({ users: users.length, failed }, { status: failed > 0 ? 500 : 200 });
}
