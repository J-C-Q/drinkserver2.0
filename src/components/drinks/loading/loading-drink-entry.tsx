"use client";
import { Skeleton } from "@/components/ui/skeleton";
export const LoadingDrinkEntry = () => {
  return (
    <div
      className={
        " text-white flex flex-row justify-end items-center relative rounded-xl bg-gray-800"
      }
    >
      <Skeleton className="w-24 h-24 rounded-lg m-2 mr-5 bg-gray-200" />
      <span className={"z-10 absolute top-50 left-8 "}>
        <Skeleton className="w-16 h-10 rounded-full mb-2 bg-gray-200" />
      </span>
    </div>
  );
};
