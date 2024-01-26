import { LoadingDrinkEntry } from "@/components/drinks/loading/loading-drink-entry";
import { LoadingNavigator } from "@/components/drinks/loading/loading-navigation";
import { LoadingOrderTable } from "@/components/drinks/loading/loading-order-table";
import { LoadingReceipt } from "@/components/drinks/loading/loading-receipt";

const LoadingDashboard = () => {
  return (
    <main className="w-screen min-h-screen">
      <LoadingNavigator />
      <LoadingReceipt />
      <LoadingOrderTable />
    </main>
  );
};

export default LoadingDashboard;
