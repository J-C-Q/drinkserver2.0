"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import { order } from "@/actions/order";
import { fetchItemQuantity } from "@/actions/fetch-item-quantity";
import { useEffect, useState } from "react";
import Image from "next/image";

interface DrinkEntryProps {
  drinkname: string;
  drinkid: string;
  drinkprice: number;
  drinkquantity: number;
  selectedQuote?: string;
  bgimage?: string;
  color?: string;
}
export const DrinkEntry = ({
  drinkname,
  drinkid,
  drinkprice,
  drinkquantity,
  selectedQuote,
  bgimage,
  color,
}: DrinkEntryProps) => {
  const session = useSession();
  const userid = session.data?.user.id;
  const [quantity, setQuantity] = useState(drinkquantity);

  const fetchquantity = async () => {
    await fetchItemQuantity(drinkid)
      .then((response) => {
        setQuantity(
          response.quantity != undefined ? response.quantity : drinkquantity
        );
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error fetching quantity, please reload the page");
      });
  };

  const possibleColors = ["text-white", "text-black"];
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="w-full text-white flex flex-row justify-end text-2xl items-center relative hover:border-2">
          {bgimage && (
            <Image
              src={bgimage}
              alt="background image"
              height={200}
              width={600}
              className="object-cover object-right -z-0"
            ></Image>
          )}
          <span className={"z-10 absolute top-50 left-10 " + `text-${color}`}>
            {quantity}left
          </span>
          {/* <span className={"z-10 absolute top-0 right-0 " + `text-${color}`}>
            {drinkprice}€
          </span> */}
        </div>
      </DrawerTrigger>
      <DrawerContent className="h-[50vh] border-none hover:border-none">
        <DrawerHeader>
          <DrawerTitle>{drinkname}</DrawerTitle>
          <DrawerDescription>
            {selectedQuote != undefined ? selectedQuote : ""}
            <br></br>
            Are you sure you want to buy {drinkname} for {drinkprice}€? There
            are currently {quantity} left.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose>
            <Button
              onClick={() => {
                if (userid) {
                  const promise = () => order(drinkid, userid);
                  toast.promise(promise, {
                    loading: `Processing order ...`,
                    success: (data) => {
                      if (data.success != undefined && data.success != "") {
                        toast.success(data.success);
                      }
                      if (data.error != undefined && data.error != "") {
                        toast.error(data.error);
                      }
                      fetchquantity();
                      return "Order processed!";
                    },
                    error: "Error",
                  });
                } else {
                  console.log("userid not found... this is bad");
                }
              }}
            >
              Buy
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
