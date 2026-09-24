import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getItems } from "@/data/item";
import { DrinkEntry } from "@/components/drinks/drink-entry";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Navigator } from "@/components/drinks/navigation";
import { OrderTable } from "@/components/drinks/order-table";

import { GithubLike } from "@/components/stats/github-like-grid";
import { Achievements } from "@/components/stats/achievements";
import {
  getAchievementsOfUser,
  getAchievementsUserDoesntHave,
} from "@/data/achievements";
import { MainStats } from "@/components/stats/mainstats";
import { getOrderHeatmapOfUser, getSugarAndCaffeinStatsOfUser } from "@/data/stats";

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
  const [heatmap, achievements, openAchievements, stats] = await Promise.all([
    getOrderHeatmapOfUser(userId),
    getAchievementsOfUser(userId),
    getAchievementsUserDoesntHave(userId),
    getSugarAndCaffeinStatsOfUser(userId),
  ]);
  const buckets = initializeBuckets();
  if (heatmap) {
    addToBuckets(heatmap, buckets);
  }
  return (
    <main className="min-h-screen w-full">
      <SessionProvider>
        <Navigator
          username={session?.user.name}
          greeting={"Stats for "}
          subtitle={"Understand your patterns"}
        ></Navigator>
      </SessionProvider>
      {/* null means a failed read; show that instead of zeros or a crash. */}
      {stats ? (
        <MainStats
          totalSugar={stats.total.sugar}
          totalCaffein={stats.total.caffeine}
          todaySugar={stats.today.sugar}
          todayCaffein={stats.today.caffeine}
          lastWeekSugar={stats.lastWeek.sugar}
          lastWeekCaffein={stats.lastWeek.caffeine}
          lastMonthSugar={stats.lastMonth.sugar}
          lastMonthCaffein={stats.lastMonth.caffeine}
        />
      ) : (
        <StatsError what="Your sugar and caffeine stats" />
      )}
      {heatmap ? <GithubLike data={buckets} /> : <StatsError what="Your drink heatmap" />}
      {achievements && openAchievements ? (
        <Achievements
          achievements={achievements}
          openAchievements={openAchievements}
        />
      ) : (
        <StatsError what="Your achievements" />
      )}
      <Toaster richColors />
    </main>
  );
};

export default StatsPage;

const StatsError = ({ what }: { what: string }) => (
  <p className="my-6 text-center text-red-400">
    {what} could not be loaded. Please reload the page.
  </p>
);

// froce dynamic
export const dynamic = "force-dynamic";

const DAYS: WeekDays[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function initializeBuckets(): WeeklyBuckets {
  const buckets: WeeklyBuckets = {} as WeeklyBuckets;

  DAYS.forEach((day) => {
    buckets[day] = {};
    for (let hour = 0; hour < 24; hour++) {
      buckets[day][hour] = 0;
    }
  });

  return buckets;
}

// Counts per Berlin weekday (0 = Sunday) and hour, from getOrderHeatmapOfUser.
function addToBuckets(
  counts: Array<{ dow: number; hour: number; count: number }>,
  buckets: WeeklyBuckets
): void {
  counts.forEach(({ dow, hour, count }) => {
    buckets[DAYS[dow]][hour] += count;
  });
}
