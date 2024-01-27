"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { FaPaypal } from "react-icons/fa";
import { PayButton } from "./pay-button";
import { HiMiniInformationCircle } from "react-icons/hi2";
interface PopupButtonProps {
  total: number;
}
export const PopupButton = ({ total }: PopupButtonProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="bg-amber-400 active:bg-amber-300 hover:bg-amber-300"
        >
          <FaPaypal className="h-5 w-5" />
          <span className="ml-1">Paypal.me</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 to-black border-amber-200 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-white mb-2">
            You will be redirected to{" "}
            <span className="bg-gradient-to-r from-amber-400  to-amber-200 inline-block text-transparent bg-clip-text">
              paypal.com/paypalme/officeDrinks/
            </span>
          </DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            <div className="rounded-lg bg-gradient-to-r from-blue-500 via-transparent to-trasparent border-blue-500 border  p-2 text-left flex flex-row items-center gap-2 text-blue-300 justify-start">
              <span className="w-[20px] h-[20px] flex items-center justify-center">
                <HiMiniInformationCircle className="w-[20px] h-[20px]" />
              </span>
              Once you&apos;ve paid, an admin will manually confirm your payment
              and mark your orders as paid.
            </div>
            <div className="rounded-lg bg-gradient-to-r from-blue-500 via-transparent to-trasparent border-blue-500 border  p-2 text-left flex flex-row items-center gap-2 text-blue-300 justify-start">
              <span className="w-[20px] h-[20px] flex items-center justify-center">
                <HiMiniInformationCircle className="w-[20px] h-[20px]" />
              </span>
              Please refrain from adding new drinks until confirmation is
              complete.
            </div>
            <div className="rounded-lg bg-gradient-to-r from-blue-500 via-transparent to-trasparent border-blue-500 border  p-2 text-left flex flex-row items-center justify-start gap-2 text-blue-300">
              <span className="w-[20px] h-[20px] flex items-center justify-center">
                <HiMiniInformationCircle className="w-[20px] h-[20px]" />
              </span>
              Refresh your dashboard to check the status of your orders.
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <PayButton
            label={"Paypal.me"}
            href={
              "https://paypal.me/officeDrinks/" +
              total.toFixed(2) +
              "EUR?country.x=DE&locale.x=de_DE/"
            }
          />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
