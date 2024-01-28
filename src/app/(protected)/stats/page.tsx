import { auth, signOut } from "@/auth";
import { getItems } from "@/data/item";
import { DrinkEntry } from "@/components/drinks/drink-entry";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Navigator } from "@/components/drinks/navigation";
import { OrderTable } from "@/components/drinks/order-table";
import { getOrdersForUser } from "@/data/order";

import { GithubLike } from "@/components/stats/github-like-grid";

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
  //   console.log(buckets);

  // sort data into buckets by date. 1 bucket per hour of the day, for 1 week (7 times 24 buckets)
  // each bucket has a count of orders for that hour of the day

  return (
    <main className="min-h-screen">
      <Navigator
        username={session?.user.name}
        greeting={"Stats for "}
        subtitle={"Impress your friends"}
      ></Navigator>
      <GithubLike data={buckets} />
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
    }) as WeekDays;
    const hour = date.toLocaleTimeString("de-DE", {
      hour: "numeric",
    }) as unknown as number;

    buckets[day][hour]++;
  });
}
