import { auth, signOut } from "@/auth";
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
import { updateAchievements } from "@/actions/update-achievements";
import { Achievement } from "@prisma/client";
import { MainStats } from "@/components/stats/mainstats";
import {
  getLastWeekSugarAndCaffeinOfUser,
  getTodaySugarAndCaffeinOfUser,
  getTotalSugarAndCaffeinOfUser,
  getLastMonthSugarAndCaffeinOfUser,
} from "@/data/stats";

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

  // do async stuff for 30 seconds
  //   await new Promise((resolve) => setTimeout(resolve, 10000));
  const data = await getOrdersForUser(session?.user.id);
  const buckets = initializeBuckets();
  if (data) {
    addToBuckets(data, buckets);
  }
  await updateAchievements(session?.user.id);
  const achievements = (await getAchievementsOfUser(
    session?.user.id
  )) as Achievement[];

  const openAchievements = (await getAchievementsUserDoesntHave(
    session?.user.id
  )) as Achievement[];

  const statsTotal = await getTotalSugarAndCaffeinOfUser(session?.user.id);
  const statsToday = await getTodaySugarAndCaffeinOfUser(session?.user.id);
  const statsLastWeek = await getLastWeekSugarAndCaffeinOfUser(
    session?.user.id
  );
  const statsLastMonth = await getLastMonthSugarAndCaffeinOfUser(
    session?.user.id
  );
  return (
    <main className="min-h-screen w-full">
      <Navigator
        username={session?.user.name}
        greeting={"Stats for "}
        subtitle={"Understand your patterns"}
      ></Navigator>
      <MainStats
        totalSugar={statsTotal?.totalSugar}
        totalCaffein={statsTotal?.totalCaffeine}
        todaySugar={statsToday?.todaySugar}
        todayCaffein={statsToday?.todayCaffeine}
        lastWeekSugar={statsLastWeek?.lastWeekSugar}
        lastWeekCaffein={statsLastWeek?.lastWeekCaffeine}
        lastMonthSugar={statsLastMonth?.lastMonthSugar}
        lastMonthCaffein={statsLastMonth?.lastMonthCaffeine}
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
