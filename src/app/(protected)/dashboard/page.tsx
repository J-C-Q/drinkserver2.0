import { auth, signOut } from "@/auth";
import { getItems } from "@/data/item";
import { DrinkEntry } from "@/components/drinks/drink-entry";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Navigator } from "@/components/drinks/navigation";
import { OrderTable } from "@/components/drinks/order-table";
import { getPendingOrdersForUser } from "@/data/order";
import { TbBottle } from "react-icons/tb";
import { Receipt } from "@/components/drinks/receipt";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { PayButton } from "@/components/paypal/pay-button";

const DashboardPage = async () => {
  const session = await auth();
  const orders = await getPendingOrdersForUser(session?.user.id);

  return (
    <main className="min-h-screen">
      <Navigator
        username={session?.user.name}
        greeting={"Dashboard for "}
        subtitle={"Manage your orders"}
        link={"/drinks"}
      >
        <TbBottle className="h-5 w-5" />
      </Navigator>
      <Receipt
        username={session?.user.name}
        userid={session?.user.id}
        orders={orders}
      />
      <PayButton />
      <OrderTable orders={orders} />
    </main>
  );
};

export default DashboardPage;
