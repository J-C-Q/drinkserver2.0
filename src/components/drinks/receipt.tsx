import { Courier_Prime } from "next/font/google";
import { Order } from "@prisma/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
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

import { PayButton } from "../paypal/pay-button";
import { PopupButton } from "../paypal/popup-button";
interface ReceiptProps {
  username: string | undefined | null;
  userid: string | undefined | null;
  orders: Order[] | null;
}

const font = Courier_Prime({
  subsets: ["latin"],
  weight: ["400"],
});

export const Receipt = ({ username, userid, orders }: ReceiptProps) => {
  const ordersByItem = orders?.reduce((acc, order) => {
    if (!acc[order.itemname]) {
      acc[order.itemname] = [0, 0];
    }
    acc[order.itemname][0] += 1;
    acc[order.itemname][1] += order.itemprice;
    return acc;
  }, {} as Record<string, number[]>);
  const ordersAsArray = Object.entries(
    ordersByItem as Record<string, number[]>
  );

  const total = ordersAsArray.reduce((acc, order) => {
    acc += order[1][1];
    return acc;
  }, 0);
  return (
    <div className="w-full flex flex-col items-center mb-10 mt-8">
      <div
        className={cn(
          "max-w-[350px] min-h-9 mx-auto flex flex-col items-center p-5 pt-10 relative  bg-white mb-7",
          font.className
        )}
      >
        <Image
          src="/receipt.svg"
          alt="reciept background"
          className="absolute bottom-0 left-0 w-full object-contain object-bottom translate-y-2 -z-0"
          fill={true}
        ></Image>
        <Image
          src="/receipt.svg"
          alt="reciept background"
          className="absolute top-0 left-0 w-full object-contain rotate-180 object-bottom -z-0 -translate-y-2"
          fill={true}
        ></Image>
        <div className="flex flex-col items-center pb-6 z-10 border-b-2 border-dashed border-gray-400 w-full">
          <h2 className="font-semibold place-center">RECEIPT</h2>
          <h1 className="font-bold text-xl">Drink Server</h1>
          <p className="text-sm text-gray-400">{username}</p>
          <p className="text-sm text-gray-400">{userid}</p>
        </div>
        <div className="text-sm flex flex-col items-center pt-2 z-10">
          <p className="gap-5 flex flex-row">
            <span>
              {new Date().toLocaleDateString("de-DE", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                timeZone: "Europe/Berlin",
              })}
            </span>
            <span>
              {new Date().toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZone: "Europe/Berlin",
              })}
            </span>
          </p>
          <Table className="w-full">
            <TableHeader className="hover:bg-white border-b-2 border-none w-full">
              <TableRow className="hover:bg-white border-none">
                <TableHead className="w-[100px]">QTY</TableHead>
                <TableHead className="w-full">ITEM</TableHead>
                <TableHead className="w-full">AMT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-black gap-0">
              {orders != undefined &&
                ordersAsArray.map((order) => (
                  <TableRow
                    key={order[0]}
                    className="border-none p-0 hover:bg-white"
                  >
                    <TableCell className="font-medium py-0">
                      {order[1][0]}
                    </TableCell>
                    <TableCell className="font-medium py-0">
                      {order[0]}
                    </TableCell>
                    <TableCell className="font-medium py-0">
                      {order[1][1].toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <div className="text-sm flex flex-row justify-between w-full pt-2 mt-2 items-center pb-10 pl-5 pr-3 z-10 border-t-2 border-dashed border-gray-400">
          <h1 className="font-semibold text-lg">Total</h1>
          <h1 className="font-semibold text-lg">{total.toFixed(2)}</h1>
        </div>
      </div>
      <PopupButton total={total} />
    </div>
  );
};
