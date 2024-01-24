"use client";

import { signIn } from "next-auth/react";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FaApple } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
export const Social = () => {
  const onClick = (provider: "google" | "github" | "apple") => {
    const promise = () =>
      signIn(provider, { callbackUrl: DEFAULT_LOGIN_REDIRECT });
    toast.promise(promise, {
      loading: `Loggin in ...`,
      success: (data) => {
        return `${provider} login successful!`;
      },
      error: "Error",
    });
  };
  return (
    <>
      <div className="flex items-center w-full gap-x-2">
        <Button
          size="lg"
          className="w-full"
          variant="outline"
          onClick={() => onClick("google")}
        >
          <FcGoogle className="h-5 w-5" />
        </Button>
        <Button
          size="lg"
          className="w-full"
          variant="outline"
          onClick={() => onClick("github")}
        >
          <FaGithub className="h-5 w-5" />
        </Button>
        <Button
          size="lg"
          className="w-full bg-gray-200 cursor-not-allowed hover:bg-gray-200"
          variant="outline"
          onClick={() => {
            toast.info("Apple login is not supported yet", {
              description:
                "One has to be a member of the Apple Developer Program to use Apple Sign In. This is not the case for me, so I can't implement it. If you want to help, please contact me.",
            });
          }}
        >
          <FaApple className="h-5 w-5 opacity-20" />
        </Button>
      </div>
      <Toaster richColors />
    </>
  );
};
