import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getItems } from "@/data/item";
import { DrinkEntry } from "@/components/drinks/drink-entry";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Navigator } from "@/components/drinks/navigation";
import { OrderTable } from "@/components/drinks/order-table";
import { getOrdersForUser } from "@/data/order";

import { GithubLike } from "@/components/stats/github-like-grid";
import { Achievements } from "@/components/stats/achievements";
import {
  getAchievementsOfUser,
  getAchievementsUserDoesntHave,
} from "@/data/achievements";
import { Achievement } from "@prisma/client";
import { MainStats } from "@/components/stats/mainstats";
import { getSugarAndCaffeinStatsOfUser } from "@/data/stats";

type WeekDays =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";
type HourlyBuckets = { [hour: number]: number };
type WeeklyBuckets = { [day in WeekDays]: HourlyBuckets };

const StatsPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/auth/login");
  }

  // do async stuff for 30 seconds
  //   await new Promise((resolve) => setTimeout(resolve, 10000));
  const data = await getOrdersForUser(userId);
  const buckets = initializeBuckets();
  if (data) {
    addToBuckets(data, buckets);
  }
  const achievements = (await getAchievementsOfUser(
    userId
  )) as Achievement[];

  const openAchievements = (await getAchievementsUserDoesntHave(
    userId
  )) as Achievement[];

  const stats = await getSugarAndCaffeinStatsOfUser(userId);
  return (
    <main className="min-h-screen w-full">
      <SessionProvider>
        <Navigator
          username={session?.user.name}
          greeting={"Stats for "}
          subtitle={"Understand your patterns"}
        ></Navigator>
      </SessionProvider>
      <MainStats
        totalSugar={stats?.total.sugar}
        totalCaffein={stats?.total.caffeine}
        todaySugar={stats?.today.sugar}
        todayCaffein={stats?.today.caffeine}
        lastWeekSugar={stats?.lastWeek.sugar}
        lastWeekCaffein={stats?.lastWeek.caffeine}
        lastMonthSugar={stats?.lastMonth.sugar}
        lastMonthCaffein={stats?.lastMonth.caffeine}
      />
      <GithubLike data={buckets} />
      <Achievements
        achievements={achievements}
        openAchievements={openAchievements}
      />
      <Toaster richColors />
    </main>
  );
};

export default StatsPage;

// froce dynamic
export const dynamic = "force-dynamic";

function initializeBuckets(): WeeklyBuckets {
  const days: WeekDays[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const buckets: WeeklyBuckets = {} as WeeklyBuckets;

  days.forEach((day) => {
    buckets[day] = {};
    for (let hour = 0; hour < 24; hour++) {
      buckets[day][hour] = 0;
    }
  });

  return buckets;
}

function addToBuckets(
  orders: Array<{ date: Date }>,
  buckets: WeeklyBuckets
): void {
  orders.forEach((order) => {
    const date = order.date;
    const day: WeekDays = date.toLocaleString("en-EN", {
      weekday: "long",
      timeZone: "Europe/Berlin",
    }) as WeekDays;
    const hour = parseInt(
      date
        .toLocaleTimeString("de-DE", {
          hour: "numeric",
          timeZone: "Europe/Berlin",
        })
        .slice(0, 3)
    ) as unknown as number;
    buckets[day][hour]++;
  });
}
