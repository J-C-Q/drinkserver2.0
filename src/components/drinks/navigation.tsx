"use client";
import { logout } from "@/actions/logout";
import { Button } from "@/components/ui/button";
import { IoLogOutSharp } from "react-icons/io5";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoStatsChart } from "react-icons/io5";
import { MdSpaceDashboard } from "react-icons/md";
import { TbBottle } from "react-icons/tb";
interface NavigatorProps {
  username: string | undefined | null;
  greeting: string;
  subtitle?: string;
}

export const Navigator = ({ username, greeting, subtitle }: NavigatorProps) => {
  const onClick = () => {
    logout();
  };
  return (
    <nav className="my-5 w-[80vw] mx-auto h-20 bg-secondary text-secondary-foreground shadow-sm rounded-md flex items-center justify-between px-5">
      <div className="">
        {username ? (
          <h1 className="sm:text-3xl font-semibold">
            {greeting} {username}
          </h1>
        ) : (
          <h1>Welcome back</h1>
        )}
        <p className="text-sm">{subtitle}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="border-none active:border-none focus:border-none"
        >
          <Button
            className=" w-fit h-fit p-2 hover:bg-secondary-foreground hover:text-secondary"
            variant={"secondary"}
          >
            <HiMenuAlt3 className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Navigation</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Button
              className="w-full p-2 hover:bg-secondary-foreground hover:text-secondary"
              variant={"secondary"}
              asChild
            >
              <Link href="/drinks" className="hover:scale-110">
                <TbBottle className="h-5 w-5" />
                <span>Drinks</span>
              </Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button
              className="w-full p-2 hover:bg-secondary-foreground hover:text-secondary"
              variant={"secondary"}
              asChild
            >
              <Link href="/dashboard" className="hover:scale-110">
                <MdSpaceDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button
              className="w-full p-2 hover:bg-secondary-foreground hover:text-secondary"
              variant={"secondary"}
              asChild
            >
              <Link href="/stats" className="hover:scale-110">
                <IoStatsChart className="h-5 w-5 hover:scale-110" />
                <span className="ml-1">Stats</span>
              </Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button
              className=" w-full p-2 hover:bg-secondary-foreground hover:text-secondary"
              variant={"secondary"}
              onClick={onClick}
            >
              <IoLogOutSharp className="h-5 w-5 hover:scale-110" />
              <span className="ml-1">Logout</span>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};
