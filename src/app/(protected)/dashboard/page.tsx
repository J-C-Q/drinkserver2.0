import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getItems } from "@/data/item";
import { DrinkEntry } from "@/components/drinks/drink-entry";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Navigator } from "@/components/drinks/navigation";
import { OrderTable } from "@/components/drinks/order-table";
import { getPendingOrdersForUser } from "@/data/order";

import { Receipt } from "@/components/drinks/receipt";

const DashboardPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/auth/login");
  }
  const orders = await getPendingOrdersForUser(userId);
  // do async stuff for 30 seconds
  //   await new Promise((resolve) => setTimeout(resolve, 10000));
  return (
    <main className="min-h-screen">
      <SessionProvider>
        <Navigator
          username={session?.user.name}
          greeting={"Dashboard for "}
          subtitle={"Manage your orders"}
        ></Navigator>
      </SessionProvider>

      {orders === null ? (
        // null means the read failed, not that there are no orders.
        <p className="mt-10 text-center text-red-400">
          Your orders could not be loaded. Please reload the page.
        </p>
      ) : (
        <>
          <Receipt
            username={session?.user.name}
            userid={userId}
            orders={orders}
          />
          <OrderTable orders={orders} />
        </>
      )}
    </main>
  );
};

export default DashboardPage;

// froce dynamic
export const dynamic = "force-dynamic";
