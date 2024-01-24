import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import { RegisterButton } from "@/components/auth/register-button";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 to-black">
      <div className="space-y-6 text-center mx-5">
        <h1
          className={cn(
            "text-4xl sm:text-6xl font-semibold text-white drop-shadow-0",
            font.className
          )}
        >
          <span className="text-amber-400">Drink Server 2.0</span>
        </h1>
        <p className="text-white text-lg">
          A tool to keep track of drink consumption in the_office
        </p>
        <div className="flex flex-col gap-2">
          <LoginButton>
            <Button variant="secondary" size="lg">
              Login
            </Button>
          </LoginButton>
          {/* <LoginButton>
            <Button variant="link" className="text-gray-400" size="lg">
              Already have an account?
            </Button>
          </LoginButton> */}
        </div>
      </div>
    </main>
  );
}
