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
import { Order } from "@prisma/client";

interface OrderTableProps {
  orders: Order[] | null;
}

export const OrderTable = ({ orders }: OrderTableProps) => {
  return (
    <Table className="w-full h-40 overflow-y-scroll">
      <TableCaption>A list of your unpaid orders.</TableCaption>
      <TableHeader className="sticky top-0">
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Drink</TableHead>
          <TableHead>Price €</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-white">
        {orders != null &&
          orders.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell className="font-medium">
                {order.date.toLocaleString("de-DE", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  timeZone: "Europe/Berlin",
                })}
              </TableCell>
              <TableCell className="font-medium">
                {order.date.toLocaleString("de-DE", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  timeZone: "Europe/Berlin",
                })}
              </TableCell>
              <TableCell>{order.itemname}</TableCell>
              <TableCell>{order.itemprice.toFixed(2)}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};
