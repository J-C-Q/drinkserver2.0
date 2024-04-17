"use client";

import { useState } from "react";

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
  const times = ["total", "day", "week", "month"];
  let [sugarPointer, setSugarPointer] = useState(0);
  let [caffeinePointer, setCaffeinePointer] = useState(0);
  return (
    <div className="grid grid-rows-1 grid-cols-2 gap-5 pt-0 w-[100%] m-auto relative h-28">
      <div
        className="bg-gradient-to-tr from-[#FF6B6B] to-[#dd4d51] grow text-center aspect-square text-5xl flex justify-center items-center relative bg-clip-text text-transparent translate-y-[-10px] m-auto font-bold w-36"
        onClick={() => {
          setSugarPointer((sugarPointer + 1) % 4);
        }}
      >
        {((sugarStats[sugarPointer ?? 0] ?? 0) / 1000 ?? 0).toFixed(2)}
        <div className="absolute text-sm left-[50%] translate-x-[-60px] top-[50%] translate-y-[-40px] text-gray-600 not-italic whitespace-nowrap">
          sugar / {times[sugarPointer]}
        </div>
        <div className="absolute text-sm  text-gray-600 not-italic left-[50%] translate-x-[320%] top-[50%] translate-y-[10%]">
          kg
        </div>
      </div>
      <div
        className="bg-gradient-to-tr from-[#FFD700] to-[#ddb900] grow text-center aspect-square text-5xl flex justify-center items-center relative bg-clip-text text-transparent translate-y-[10px] m-auto font-bold w-36"
        onClick={() => {
          setCaffeinePointer((caffeinePointer + 1) % 4);
        }}
      >
        {((caffeineStats[caffeinePointer ?? 0] ?? 0) / 1000).toFixed(2)}
        <div className="absolute text-sm left-[50%] translate-x-[-60px] top-[50%] translate-y-[-40px] text-gray-600 not-italic whitespace-nowrap">
          caffeine / {times[caffeinePointer]}
        </div>
        <div className="absolute text-sm  text-gray-600 not-italic left-[50%] translate-x-[580%] top-[50%] translate-y-[10%]">
          g
        </div>
      </div>
      <span className="w-full text-sm text-center absolute bottom-[0px] translate-y-[100%] text-gray-600">
        Your stats
      </span>
    </div>
  );
};
