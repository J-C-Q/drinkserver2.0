import { auth, signOut } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { Navigator } from "@/components/drinks/navigation";
import { getAllUsers } from "@/data/user";
import { getPendingOrdersForUser } from "@/data/order";
import { getCompletedOrdersForUser } from "@/data/order";
import {getTotalMoneyPending, getTotalMoneyCompleted,verifyPendingOrdersForUser} from "@/data/order";
import { ClearPending } from "@/components/admin/clear-pending";

const AdminPage = async () => {
  const session = await auth();
  const users = await getAllUsers();
  return (
    <main className="min-h-screen w-full">
      <SessionProvider>
        <Navigator
          username={session?.user.name}
          greeting={"Admin "}
          subtitle={"Manage the service"}
        ></Navigator>
      </SessionProvider>

    <div className="w-full flex flex-col gap-2 p-2 text-white">
        <h1 className="text-2xl font-bold">Total</h1>
        <div className="p-2 border rounded">
          <p className="text-lg font-semibold">
            Total Pending Money: 
            {await getTotalMoneyPending().then((res) => res?.toFixed(2) || 0)}
          </p>
          <p className="text-lg font-semibold">
            Total Completed Money: 
            {await getTotalMoneyCompleted().then((res) => res?.toFixed(2) || 0)}
          </p>
        </div>
        
        <h1 className="text-2xl font-bold">Users</h1>
        {users &&
        users.map(async (user) => {
            const pendingOrders =  await getPendingOrdersForUser(user.id);
            const pendingMoney = pendingOrders?.reduce((acc, order) => acc + order.itemprice, 0) || 0;
            const completedOrders = await getCompletedOrdersForUser(user.id);
            const completedMoney = completedOrders?.reduce((acc, order) => acc + order.itemprice, 0) || 0;
            return (
            <div key={user.id} className="p-2 border rounded">
                <p>{user.name} ({user.id})</p>
                <p>Orders pending: {pendingOrders?.length}</p>
                <p>Pending amount: ${pendingMoney.toFixed(2)}</p>
                <p>Orders completed: {completedOrders?.length}</p>
                <p>Completed amount: ${completedMoney.toFixed(2)}</p>
                <ClearPending userid={user.id} />
            </div>
            
            );  
        })}
    </div>
    </main>
  );
};

export default AdminPage;

// froce dynamic
export const dynamic = "force-dynamic";
