import { logout } from "@/actions/logout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NavigatorProps {
  username: string | undefined | null;
  greeting: string;
  subtitle?: string;
  link: string;
  children?: React.ReactNode;
}

export const Navigator = ({
  username,
  greeting,
  subtitle,
  link,
  children,
}: NavigatorProps) => {
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

      <Button
        className=" w-fit h-fit p-2 hover:bg-secondary-foreground hover:text-secondary"
        variant={"secondary"}
      >
        <Link href={link}>{children}</Link>
      </Button>
    </nav>
  );
};
