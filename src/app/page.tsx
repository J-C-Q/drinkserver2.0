import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import { BsStars } from "react-icons/bs";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Home() {
  return (
    <main className="flex h-[100lvh] flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 to-black">
      <div className="space-y-6 text-center mx-5">
        <h1
          className={cn(
            "text-4xl sm:text-6xl font-semibold text-white drop-shadow-0 relative",
            font.className
          )}
        >
          <span className="text-amber-400 relative">
            Drink Server 2.0
            {/* <BsStars className="absolute -translate-x-14" /> */}
          </span>
          <BsStars className="absolute right-0 sm:-right-12 -top-10 text-amber-400" />
        </h1>
        <p className="text-gray-400 text-lg">
          Monitor Your Drink Intake Effortlessly
        </p>
        <div className="flex flex-col gap-2">
          <LoginButton>
            <Button variant="secondary" size="lg">
              Login
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
