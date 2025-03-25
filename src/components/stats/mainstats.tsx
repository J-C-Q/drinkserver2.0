"use client";

import { useState } from "react";
import { Roboto_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
interface MainStatsProps {
  totalSugar?: number;
  totalCaffein?: number;
  todaySugar?: number;
  todayCaffein?: number;
  lastWeekSugar?: number;
  lastWeekCaffein?: number;
  lastMonthSugar?: number;
  lastMonthCaffein?: number;
}

const font = Roboto_Mono({
  subsets: ["latin"],
  weight: ["700"],
});

export const MainStats = (
  {
    totalSugar,
    totalCaffein,
    todaySugar,
    todayCaffein,
    lastWeekSugar,
    lastWeekCaffein,
    lastMonthSugar,
    lastMonthCaffein,
  }: MainStatsProps = {
    totalSugar: 0,
    totalCaffein: 0,
    todaySugar: 0,
    todayCaffein: 0,
    lastWeekSugar: 0,
    lastWeekCaffein: 0,
    lastMonthSugar: 0,
    lastMonthCaffein: 0,
  }
) => {
  const sugarStats = [totalSugar, todaySugar, lastWeekSugar, lastMonthSugar];
  const caffeineStats = [
    totalCaffein,
    todayCaffein,
    lastWeekCaffein,
    lastMonthCaffein,
  ];
  const times = ["total", "today", "week", "month"];
  let [pointer, setPointer] = useState(0);
  return (
    <div
      className="grid grid-rows-1 grid-cols-2 gap-5 pt-0 w-[100%] m-auto relative h-28 group"
      onClick={() => {
        setPointer((pointer + 1) % 4);
      }}
    >
      <div
        className={cn(
          "bg-gradient-to-tr from-[#FF6B6B] to-[#dd4d51] grow text-center text-5xl flex justify-center items-center relative font-bold bg-clip-text text-transparent translate-y-[-10px]  " +
            font.className
        )}
      >
        {((sugarStats[pointer ?? 0] ?? 0) / 1000).toFixed(2)}

        <div className="absolute text-sm left-[50%] translate-x-[-60px] top-[50%] translate-y-[-40px] text-gray-600 not-italic whitespace-nowrap">
          sugar
        </div>
        <div className="absolute text-sm  text-gray-600 not-italic left-[50%] translate-x-[60px] top-[50%] translate-y-[10%]">
          kg
        </div>
      </div>
      <div
        className={cn(
          "bg-gradient-to-tr from-[#FFD700] to-[#ddb900] grow text-center text-5xl flex justify-center items-center relative font-bold bg-clip-text text-transparent translate-y-[10px] " +
            font.className
        )}
      >
        {((caffeineStats[pointer ?? 0] ?? 0) / 1000).toFixed(2)}
        <div className="absolute text-sm left-[50%] translate-x-[-60px] top-[50%] translate-y-[-40px] text-gray-600 not-italic whitespace-nowrap">
          caffeine
        </div>
        <div className="absolute text-sm  text-gray-600 not-italic left-[50%] translate-x-[60px] top-[50%] translate-y-[10%]">
          g
        </div>
      </div>
      <span className="w-full text-sm text-center absolute bottom-[25px] translate-y-[100%] text-gray-600">
        Your stats
      </span>
      <span className="text-lg font-bold text-center absolute top-[-25px] left-[50%] translate-y-[100%] translate-x-[-50%] text-gray-600 group-active:scale-110 transition-scale duration-200 w-24">
        {times[pointer]}
      </span>
    </div>
  );
};
