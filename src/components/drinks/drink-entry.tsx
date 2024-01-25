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

interface DrinkEntryProps {
  drinkname: string;
  drinkid: string;
  drinkprice: number;
  drinkquantity: number;
}

export const DrinkEntry = ({
  drinkname,
  drinkid,
  drinkprice,
  drinkquantity,
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
  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <div className="w-full bg-black text-white min-h-40 flex flex-row justify-around text-2xl items-center">
            <span>{drinkname}</span> <span>{quantity}left</span>{" "}
            <span>{drinkprice}€</span>
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{drinkname}</DrawerTitle>
            <DrawerDescription>
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
    </>
  );
};
