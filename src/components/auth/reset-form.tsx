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
import { reset } from "@/actions/reset";

import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ResetSchema } from "@/schemas";

export const ResetForm = () => {
  //   const searchParams = useSearchParams();
  //   let urlError = "";
  //   if (searchParams.get("error") === "OAuthAccountNotLinked") {
  //     urlError = "Email already in use with different provider";
  //     // toast.error(urlError);
  //   }

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    startTransition(() => {
      reset(values).then((data) => {
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
        headerTitle="Reset Password"
        headerLabel="Forgot your password?"
        backButtonLabel="Back to login"
        backButtonHref="/auth/login"
        showSocial={false}
        useCollapsible={false}
        collapsibleLabel="CONTINUE WITH EMAIL"
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
            </div>
            <Button disabled={isPending} type="submit" className="w-full">
              Send reset email
            </Button>
          </form>
        </Form>
      </CardWrapper>
      <Toaster richColors />
    </>
  );
};
