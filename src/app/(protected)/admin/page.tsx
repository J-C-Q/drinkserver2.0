import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Navigator } from "@/components/drinks/navigation";
import { getAllUsers } from "@/data/user";
import {getTotalMoneyPending, getTotalMoneyCompleted, getOrderTotalsByUser} from "@/data/order";
import { ClearPending } from "@/components/admin/clear-pending";
import { currentAdmin } from "@/lib/auth-guard";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const AdminPage = async () => {
  const admin = await currentAdmin();
  if (!admin) {
    redirect(DEFAULT_LOGIN_REDIRECT);
  }
  const users = await getAllUsers();
  const totalsByUser = await getOrderTotalsByUser();
  return (
    <main className="min-h-screen w-full">
      <SessionProvider>
        <Navigator
          username={admin.name}
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
        {(users === null || totalsByUser === null) && (
          <p className="text-red-400">Users or orders could not be loaded.</p>
        )}
        {users && totalsByUser &&
        users.map((user) => {
            const totals = totalsByUser.get(user.id);
            return (
            <div key={user.id} className="p-2 border rounded">
                <p>{user.name} ({user.id})</p>
                <p>Orders pending: {totals?.pendingCount ?? 0}</p>
                <p>Pending amount: ${(totals?.pendingAmount ?? 0).toFixed(2)}</p>
                <p>Orders completed: {totals?.completedCount ?? 0}</p>
                <p>Completed amount: ${(totals?.completedAmount ?? 0).toFixed(2)}</p>
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
