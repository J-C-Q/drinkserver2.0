"use client";
import { logout } from "@/actions/logout";
import { Button } from "@/components/ui/button";

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
      <Button className="" onClick={onClick}>
        Logout
      </Button>
    </nav>
  );
};
