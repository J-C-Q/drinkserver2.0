"use client";
import { BeatLoader } from "react-spinners";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { newVerification } from "@/actions/new-verification";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { set } from "zod";

export const NewVerificationForm = () => {
  const [done, setDone] = useState(false);
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (done) return;
    if (!token) {
      toast.error("Missing token");
      setDone(true);
      return;
    }
    newVerification(token)
      .then((data) => {
        if (data.success != undefined && data.success != "") {
          toast.success(data.success);
        }
        if (data.error != undefined && data.error != "") {
          toast.error(data.error);
        }
        setDone(true);
      })
      .catch((error) => {
        toast.error("Something went wrong");
        setDone(true);
      });
  }, [token, done]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <>
      <CardWrapper
        headerTitle="Verification"
        headerLabel={
          !done ? "Your confirmation is being verified..." : "Processed!"
        }
        backButtonHref="/auth/login"
        backButtonLabel="Back to login"
        useCollapsible={false}
        collapsibleLabel=""
      >
        <div className="flex items-center w-full justify-center">
          {!done && <BeatLoader />}
        </div>
      </CardWrapper>
      <Toaster richColors />
    </>
  );
};
