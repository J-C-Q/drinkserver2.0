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

export const LoadingReceipt = () => {
  return (
    <div className="w-full flex flex-col items-center mb-10">
      <div className="max-w-[350px] min-h-9 mx-auto flex flex-col items-center p-5 pt-8 relative bg-white mb-7">
        <div className="flex flex-col items-center pb-6 z-10 border-b-2 border-dashed border-gray-400 w-full">
          <Skeleton className="w-28 h-5 rounded-full mb-2 bg-gray-200" />
          <Skeleton className="w-40 h-5 rounded-full mb-2 bg-gray-200" />
          <Skeleton className="w-28 h-4 rounded-full mb-2 bg-gray-200" />
          <Skeleton className="w-52 h-4 rounded-full mb-2 bg-gray-200" />
        </div>
        <div className="text-sm flex flex-col items-center pt-2 z-10">
          <Skeleton className="w-32 h-4 rounded-full mb-2 bg-gray-200" />
          <Table className="w-full">
            <TableHeader className="hover:bg-white border-b-2 border-none w-full">
              <TableRow className="hover:bg-white border-none">
                <TableHead className="w-[100px]">
                  <Skeleton className="w-8 h-6 rounded-full mb-2 bg-gray-200" />
                </TableHead>
                <TableHead className="w-[100px]">
                  <Skeleton className="w-10 h-6 rounded-full mb-2 bg-gray-200" />
                </TableHead>
                <TableHead className="w-[100px]">
                  <Skeleton className="w-8 h-6 rounded-full mb-2 bg-gray-200" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-black gap-0">
              <TableRow className="border-none p-0 hover:bg-white">
                <TableCell className="font-medium py-0">
                  <Skeleton className="w-6 h-4 rounded-full mb-2 bg-gray-200" />
                </TableCell>
                <TableCell className="font-medium py-0">
                  <Skeleton className="w-32 h-4 rounded-full mb-2 bg-gray-200" />
                </TableCell>
                <TableCell className="font-medium py-0">
                  <Skeleton className="w-8 h-4 rounded-full mb-2 bg-gray-200" />
                </TableCell>
              </TableRow>
              <TableRow className="border-none p-0 hover:bg-white">
                <TableCell className="font-medium py-0">
                  <Skeleton className="w-6 h-4 rounded-full mb-2 bg-gray-200" />
                </TableCell>
                <TableCell className="font-medium py-0">
                  <Skeleton className="w-48 h-4 rounded-full mb-2 bg-gray-200" />
                </TableCell>
                <TableCell className="font-medium py-0">
                  <Skeleton className="w-8 h-4 rounded-full mb-2 bg-gray-200" />
                </TableCell>
              </TableRow>
              <TableRow className="border-none p-0 hover:bg-white">
                <TableCell className="font-medium py-0">
                  <Skeleton className="w-6 h-4 rounded-full mb-2 bg-gray-200" />
                </TableCell>
                <TableCell className="font-medium py-0">
                  <Skeleton className="w-16 h-4 rounded-full mb-2 bg-gray-200" />
                </TableCell>
                <TableCell className="font-medium py-0">
                  <Skeleton className="w-8 h-4 rounded-full mb-2 bg-gray-200" />
                </TableCell>
              </TableRow>
              <TableRow className="border-none p-0 hover:bg-white">
                <TableCell className="font-medium py-0">
                  <Skeleton className="w-6 h-4 rounded-full mb-2 bg-gray-200" />
                </TableCell>
                <TableCell className="font-medium py-0">
                  <Skeleton className="w-40 h-4 rounded-full mb-2 bg-gray-200" />
                </TableCell>
                <TableCell className="font-medium py-0">
                  <Skeleton className="w-8 h-4 rounded-full mb-2 bg-gray-200" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="text-sm flex flex-row justify-between w-full pt-2 mt-2 items-center pb-10 pl-5 pr-3 z-10 border-t-2 border-dashed border-gray-400">
          <Skeleton className="w-20 h-6 rounded-full mb-2 bg-gray-200" />
          <Skeleton className="w-12 h-6 rounded-full mb-2 bg-gray-200" />
        </div>
      </div>
      <Skeleton className="w-32 h-8 rounded-md mb-2 bg-gray-200" />
    </div>
  );
};
