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

import { Skeleton } from "@/components/ui/skeleton";

export const LoadingOrderTable = () => {
  return (
    <Table className="w-[90%] mx-auto">
      <TableCaption>
        <Skeleton className="w-32 h-3 rounded-full mb-2 bg-gray-200" />
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Skeleton className="w-10 h-4 rounded-full mb-2 bg-gray-200" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-10 h-4 rounded-full mb-2 bg-gray-200" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-10 h-4 rounded-full mb-2 bg-gray-200" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-12 h-4 rounded-full mb-2 bg-gray-200" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-white">
        <TableRow>
          <TableCell className="font-medium">
            <Skeleton className="w-16 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
          <TableCell className="font-medium">
            <Skeleton className="w-16 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-20 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-12 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">
            <Skeleton className="w-16 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
          <TableCell className="font-medium">
            <Skeleton className="w-16 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-32 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-12 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">
            <Skeleton className="w-16 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
          <TableCell className="font-medium">
            <Skeleton className="w-16 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-16 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-12 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">
            <Skeleton className="w-16 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
          <TableCell className="font-medium">
            <Skeleton className="w-16 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-24 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-12 h-4 rounded-full mb-2 bg-gray-200" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
