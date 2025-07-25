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

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

import { toast } from "sonner";

import { order } from "@/actions/order";
import { fetchItemQuantity } from "@/actions/fetch-item-quantity";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface DrinkEntryProps {
  drinkname: string;
  drinkid: string;
  drinkprice: number;
  drinkquantity: number;
  drinkEnergy?: number;
  drinkCarbohydrates?: number;
  drinkSugars?: number;
  drinkCaffein?: number;
  selectedQuote?: string;
  bgimage?: string;
  bgcolor?: string;
  color?: string;
}
export const DrinkEntry = ({
  drinkname,
  drinkid,
  drinkprice,
  drinkquantity,
  drinkEnergy,
  drinkCarbohydrates,
  drinkSugars,
  drinkCaffein,
  selectedQuote,
  bgimage,
  bgcolor,
  color,
}: DrinkEntryProps) => {
  const session = useSession();
  const userid = session.data?.user.id;
  const [quantity, setQuantity] = useState(drinkquantity);

  //   const fetchquantity = async () => {
  //     await fetchItemQuantity(drinkid)
  //       .then((response) => {
  //         setQuantity(
  //           response.quantity != undefined ? response.quantity : drinkquantity
  //         );
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //         toast.error("Error fetching quantity, please reload the page");
  //       });
  //   };

  const possibleColors = [
    "text-white",
    "text-black",
    "bg-rot",
    "bg-gelb",
    "bg-braun",
    "bg-schwarz",
    "bg-weiss",
    "text-white/10",
    "text-black/10",
    "bg-hellrot",
    "bg-orange",
    "bg-blau",
    "bg-gruen",
    "bg-pink"
  ];

  const router = useRouter();

  return (
    <Drawer>
      <DrawerTrigger>
        <div
          className={
            " text-white flex flex-row justify-end items-center relative active:scale-95 transition-scale duration-200 cursor-pointer rounded-xl " +
            `bg-${bgcolor}`
          }
        >
          {bgimage && (
            <Image
              src={bgimage}
              alt="background image"
              height={200}
              width={600}
              className="-z-0 rounded-xl"
              quality={100}
            ></Image>
          )}
          <span
            className={
              "z-10 absolute top-50 left-7 rounded-lg px-2 " + `text-${color}`
            }
          >
            <span className="font-semibold text-2xl ">{quantity + " "}</span>
            <span className="text-sm">in stock</span>
          </span>
        </div>
      </DrawerTrigger>
      <DrawerContent
        className={"h-fit border-none outline-none " + `bg-${bgcolor}`}
      >
        <DrawerHeader>
          <DrawerTitle className={"text-4xl sm:text-6xl " + `text-${color}`}>
            {drinkname}
          </DrawerTitle>
          <DrawerDescription
            className={"text-md sm:text-2xl " + `text-${color}`}
          >
            {selectedQuote != undefined ? selectedQuote : ""}
          </DrawerDescription>
          <Table className="w-[80%] h-10 m-auto">
            {/* <TableCaption>Nutritional information</TableCaption> */}
            <TableBody className={`text-${color}`}>
              <TableRow>
                <TableCell className="font-medium text-left">Energy</TableCell>
                <TableCell className="font-medium">
                  {!drinkEnergy || drinkEnergy == 0
                    ? "-"
                    : drinkEnergy + " kcal"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-left">
                  Carbohydrates
                </TableCell>
                <TableCell className="font-medium">
                  {!drinkCarbohydrates || drinkCarbohydrates == 0
                    ? "-"
                    : drinkCarbohydrates + " g"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-left">Sugars</TableCell>
                <TableCell className="font-medium">
                  {!drinkSugars || drinkSugars == 0 ? "-" : drinkSugars + " g"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-left">Caffein</TableCell>
                <TableCell className="font-medium">
                  {!drinkCaffein || drinkCaffein == 0
                    ? "-"
                    : drinkCaffein + " mg"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DrawerHeader>
        <DrawerFooter
          className={"text-md relative sm:text-xl  " + `text-${color}`}
        >
          {/* <p className="whitespace-nowrap text-center w-full">
            Buy for
            <span className="font-semibold"> {drinkprice.toFixed(2)}€</span>?
          </p> */}
          <span
            className={
              "absolute top-0 -translate-y-[60%] -translate-x-[50%] [writing-mode:vertical-lr] " +
              `text-${color}/10`
            }
          >
            {drinkid}
          </span>
          <DrawerClose>
            <Button
              className="w-[80%] h-12 bg-transparent"
              variant="outline"
              onClick={() => {
                if (userid) {
                  const promise = () => order(drinkid, userid);
                  toast.promise(promise, {
                    loading: `Processing order ...`,
                    success: (data) => {
                      if (data.success != undefined && data.success != "") {
                        toast.success(data.success);
                        setQuantity(quantity - 1);
                      }
                      if (data.error != undefined && data.error != "") {
                        toast.error(data.error);
                      }
                      //   fetchquantity();

                      return "Order processed!";
                    },
                    error: "Error",
                  });
                } else {
                  toast.error("Userid not found, please reload the page");
                }
              }}
            >
              <span className="text-xl font-semibold">
                Buy for
                <span className="font-semibold"> {drinkprice.toFixed(2)}€</span>
              </span>
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
