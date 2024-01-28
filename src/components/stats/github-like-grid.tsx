"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Roboto_Mono } from "next/font/google";
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
interface GithubLikeProps {
  data: WeeklyBuckets;
}

const font = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400"],
});

export const GithubLike = ({ data }: GithubLikeProps) => {
  const maxValue = Math.max(
    Math.max(
      ...Object.values(data).map((day) => Math.max(...Object.values(day)))
    ),
    5
  );
  const possibleOpacity = [
    "opacity-[0.0]",
    "opacity-[0.1]",
    "opacity-[0.2]",
    "opacity-[0.3]",
    "opacity-[0.4]",
    "opacity-[0.5]",
    "opacity-[0.6]",
    "opacity-[0.7]",
    "opacity-[0.8]",
    "opacity-[0.9]",
    "opacity-[1.0]",
  ];
  return (
    <div className=" text-gray-500 text-sm sm:w-[80%] sm:mx-auto w-full">
      <div className="aspect-[24/7] grid grid-rows-7 grid-cols-1 gap-[1%] relative my-10 mx-2 group ">
        {data &&
          Object.keys(data).map((day) => (
            <div
              className="row-span-1 col-span-1 grid grid-rows-1 grid-cols-24 gap-[1%] grid-flow-col relative "
              key={day}
            >
              <span
                className={cn(
                  "absolute top-[38%] translate-y-[-50%] translate-x-[-100%] left-[-2%] text-right flex group-active:opacity-100 opacity-0 justify-center items-center text-[10px] sm:text-sm transition-opacity group-hover:opacity-100 duration-200 " +
                    font.className
                )}
              >
                {day.slice(0, 3)}
              </span>

              {Object.keys(data[day as WeekDays]).map((hour) => (
                <div
                  key={hour}
                  className={`row-span-1 col-span-1 bg-gray-800/75 sm:rounded-md rounded-md  aspect-square w-full relative`}
                >
                  {day === "Saturday" && parseInt(hour) % 2 == 0 && (
                    <span
                      className={cn(
                        "absolute bottom-[-50%] translate-y-[100%] left-[0%] translate-x-[-50%] justify-center items-center [writing-mode:vertical-rl] text-[10px] flex group-active:opacity-100 group-hover:opacity-100 opacity-0 transition-opacity duration-200 sm:text-sm " +
                          font.className
                      )}
                    >
                      {"" + (parseInt(hour) < 10 ? "0" : "") + hour + ":00"}
                    </span>
                  )}
                  <Popover>
                    <PopoverTrigger asChild>
                      <div
                        key={hour}
                        className={`row-span-1 col-span-1 bg-amber-400 sm:rounded-md rounded-md aspect-square w-full opacity-[${(
                          data[day as WeekDays][hour as unknown as number] /
                          maxValue
                        ).toFixed(1)}]`}
                      ></div>
                    </PopoverTrigger>
                    <PopoverContent className="h-fit w-fit hidden m-0 bg-trasparent text-white p-0 px-2 border-none">
                      {data[day as WeekDays][hour as unknown as number]}
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          ))}
        <span className="w-full text-center absolute bottom-[-2%] translate-y-[100%] text-gray-600 group-active:opacity-0 group-hover:opacity-0 opacity-100 transition-opacity duration-200">
          Your drink heatmap
        </span>
      </div>
    </div>
  );
};
