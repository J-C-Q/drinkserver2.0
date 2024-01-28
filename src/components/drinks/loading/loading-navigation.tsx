"use client";
import { logout } from "@/actions/logout";
import { Button } from "@/components/ui/button";
import { IoLogOutSharp } from "react-icons/io5";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";

export const LoadingNavigator = () => {
  return (
    <nav className="my-5 w-[80vw] mx-auto h-20 bg-secondary text-secondary-foreground shadow-sm rounded-md flex items-center justify-between px-5 ">
      <div className="">
        <Skeleton className="w-32 h-6 rounded-full mb-2 bg-gray-200" />
        <Skeleton className="w-24 h-4 rounded-full bg-gray-200" />
      </div>
      <Skeleton className="w-8 h-8 rounded-md bg-gray-200" />
    </nav>
  );
};
