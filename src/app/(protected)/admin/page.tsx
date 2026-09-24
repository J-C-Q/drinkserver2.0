import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Navigator } from "@/components/drinks/navigation";
import { Toaster } from "@/components/ui/sonner";
import { getAllUsers } from "@/data/user";
import {
  getTotalMoneyPending,
  getTotalMoneyCompleted,
  getOrderTotalsByUser,
  getPendingOrdersByUser,
  getRecentPayments,
} from "@/data/order";
import { RecordPayment } from "@/components/admin/record-payment";
import { currentAdmin } from "@/lib/auth-guard";
import { formatCents } from "@/lib/money";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const AdminPage = async () => {
  const admin = await currentAdmin();
  if (!admin) {
    redirect(DEFAULT_LOGIN_REDIRECT);
  }
  const [users, totalsByUser, pendingByUser, payments, totalPending, totalCompleted] =
    await Promise.all([
      getAllUsers(),
      getOrderTotalsByUser(),
      getPendingOrdersByUser(),
      getRecentPayments(),
      getTotalMoneyPending(),
      getTotalMoneyCompleted(),
    ]);
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
            Total Pending Money: {totalPending === null ? "?" : formatCents(totalPending)}
          </p>
          <p className="text-lg font-semibold">
            Total Completed Money: {totalCompleted === null ? "?" : formatCents(totalCompleted)}
          </p>
        </div>

        <h1 className="text-2xl font-bold">Users</h1>
        {(users === null || totalsByUser === null || pendingByUser === null) && (
          <p className="text-red-400">Users or orders could not be loaded.</p>
        )}
        {users && totalsByUser && pendingByUser &&
        users.map((user) => {
            const totals = totalsByUser.get(user.id);
            const pending = pendingByUser.get(user.id);
            return (
            <div key={user.id} className="p-2 border rounded">
                <p>{user.name} ({user.id})</p>
                <p>Orders pending: {totals?.pendingCount ?? 0}</p>
                <p>Pending amount: ${formatCents(totals?.pendingCents ?? 0)}</p>
                <p>Orders completed: {totals?.completedCount ?? 0}</p>
                <p>Completed amount: ${formatCents(totals?.completedCents ?? 0)}</p>
                {pending && (
                  <RecordPayment
                    // Remount with fresh defaults when the pending orders change.
                    key={pending.orderIds.join(",")}
                    userId={user.id}
                    orderIds={pending.orderIds}
                    pendingCents={pending.cents}
                  />
                )}
            </div>
            );
        })}

        <h1 className="text-2xl font-bold">Recent payments</h1>
        {payments === null && <p className="text-red-400">Payments could not be loaded.</p>}
        {payments && payments.length === 0 && <p className="text-gray-400">No payments recorded yet.</p>}
        {payments && payments.map((payment) => (
          <div key={payment.id} className="p-2 border rounded text-sm">
            <p>
              {payment.createdAt.toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}: {payment.user.name} paid {formatCents(payment.amountCents)} for {payment._count.orders} order{payment._count.orders === 1 ? "" : "s"} ({formatCents(payment.ordersCents)})
            </p>
            <p className="text-gray-400">
              Confirmed by {payment.confirmedBy.name}{payment.reference ? ` · Ref: ${payment.reference}` : ""}
            </p>
          </div>
        ))}
    </div>
    <Toaster richColors />
    </main>
  );
};

export default AdminPage;

// froce dynamic
export const dynamic = "force-dynamic";
