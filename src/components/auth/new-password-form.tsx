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
import { newPassword } from "@/actions/new-password";

import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { NewPasswordSchema } from "@/schemas";

export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    startTransition(() => {
      newPassword(values, token).then((data) => {
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
        headerTitle="New Password"
        headerLabel="Enter a new password"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder=""
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button disabled={isPending} type="submit" className="w-full">
              Reset password
            </Button>
          </form>
        </Form>
      </CardWrapper>
      <Toaster richColors />
    </>
  );
};
