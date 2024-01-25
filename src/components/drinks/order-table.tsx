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
    <Table>
      <TableCaption>A list of your unpayerd orders.</TableCaption>
      <TableHeader>
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
                {order.date.getDate() +
                  "." +
                  (order.date.getMonth() + 1) +
                  "." +
                  order.date.getFullYear()}
              </TableCell>
              <TableCell className="font-medium">
                {order.date.getHours() + ":" + order.date.getMinutes()}
              </TableCell>
              <TableCell>{order.itemname}</TableCell>
              <TableCell>{order.itemprice.toFixed(2)}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};
