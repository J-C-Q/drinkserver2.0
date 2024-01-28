"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
export const LoadingGithubLike = () => {
  return (
    <div className=" text-gray-500 text-sm sm:w-[80%] sm:mx-auto w-full">
      <div className="aspect-[24/7] grid grid-rows-7 grid-cols-1 gap-[1%] relative my-10 mx-2 group">
        {Array.from(Array(7).keys()).map((day) => (
          <div
            className="row-span-1 col-span-1 grid grid-rows-1 grid-cols-24 gap-[1%] grid-flow-col relative"
            key={day}
          >
            {Array.from(Array(24).keys()).map((hour) => (
              <div
                key={hour}
                className={`row-span-1 col-span-1 sm:rounded-md rounded-md aspect-square w-full relative`}
              >
                <Popover>
                  <PopoverTrigger asChild>
                    {/* <div
                      key={hour}
                      className={`row-span-1 col-span-1 bg-green-600 sm:rounded-md rounded-md aspect-square w-full`}
                    ></div> */}
                    <Skeleton className="sm:rounded-md rounded-md aspect-square w-full row-span-1 col-span-1 bg-gray-200" />
                  </PopoverTrigger>
                  <PopoverContent></PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        ))}
        <span className="w-full text-center absolute bottom-[-2%] translate-y-[100%] text-gray-600 group-active:opacity-0 group-hover:opacity-0 opacity-100 transition-opacity duration-200 flex justify-center items-center">
          <Skeleton className="w-32 h-4 rounded-full bg-gray-200" />
        </span>
      </div>
    </div>
  );
};
