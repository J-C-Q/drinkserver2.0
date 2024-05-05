import { auth, signOut } from "@/auth";
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
  const orders = await getPendingOrdersForUser(session?.user.id);
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

      <Receipt
        username={session?.user.name}
        userid={session?.user.id}
        orders={orders}
      />
      <OrderTable orders={orders} />
    </main>
  );
};

export default DashboardPage;

// froce dynamic
export const dynamic = "force-dynamic";
