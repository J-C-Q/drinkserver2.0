"use client";
import * as z from "zod";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { LoginSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { Button } from "@/components/ui/button";
import { login } from "@/actions/login";

import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Link from "next/link";
import { FadeLoader } from "react-spinners";
export const LoginForm = () => {
  //   const searchParams = useSearchParams();
  //   let urlError = "";
  //   if (searchParams.get("error") === "OAuthAccountNotLinked") {
  //     urlError = "Email already in use with different provider";
  //     // toast.error(urlError);
  //   }

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(() => {
      login(values).then((data) => {
        if (data.success != undefined && data.success != "") {
          toast.success(data.success);
        }
        if (data.error != undefined && data.error != "") {
          toast.error(data.error);
        }
      });

      //   toast.promise(promise, {
      //     loading: `Loggin in ...`,
      //     success: (data) => {
      //       return `Login successful!`;
      //     },
      //     error: "Error",
      //   });
    });
  };

  return (
    <>
      <CardWrapper
        headerTitle="Welcome back!"
        headerLabel="Login to the drink server"
        backButtonLabel="Don't have an account?"
        backButtonHref="/auth/register"
        showSocial
        useCollapsible
        collapsibleLabel="continue with email"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder=""
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder=""
                        type="password"
                      />
                    </FormControl>
                    <Button
                      size="sm"
                      variant="link"
                      asChild
                      className="px-0 font-normal"
                    >
                      <Link href="/auth/reset">Forgot password?</Link>
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button disabled={isPending} type="submit" className="w-full">
              Login with email
            </Button>
          </form>
        </Form>
      </CardWrapper>
      <Toaster richColors />
    </>
  );
};
