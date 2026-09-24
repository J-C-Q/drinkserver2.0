"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { currentAdmin } from "@/lib/auth-guard";
import { formatCents } from "@/lib/money";

type PaymentResult = { success?: string; error?: string; code: number };

// What the admin saw on the page for this user.
export type PendingSnapshot = { count: number; cents: number; latest: string };

class OrdersChangedError extends Error {}

const MAX_CENTS = 100_000_00;

// Records a payment an admin received and settles the user's pending orders
// up to snapshot.latest, the newest pending order the admin saw. Orders placed
// afterwards stay pending. Nothing is settled unless those orders still have
// exactly the count and total the admin saw, and the amount received covers
// the total: underpayment is refused, overpayment is recorded as received.
export const recordPayment = async (
    userId: string,
    snapshot: PendingSnapshot,
    amountCents: number,
    reference?: string,
): Promise<PaymentResult> => {
    const admin = await currentAdmin();
    if (!admin) {
        return { error: "You are not authorized to perform this action!", code: 403 };
    }

    // Server action arguments are not type-checked at runtime.
    const latest = typeof snapshot?.latest === "string" ? new Date(snapshot.latest) : null;
    if (
        typeof userId !== "string" || userId === "" ||
        !Number.isInteger(snapshot?.count) || snapshot.count < 1 ||
        !Number.isInteger(snapshot?.cents) || snapshot.cents < 0 || snapshot.cents > MAX_CENTS ||
        latest === null || Number.isNaN(latest.getTime())
    ) {
        return { error: "Invalid payment details.", code: 400 };
    }
    if (!Number.isInteger(amountCents) || amountCents < 0 || amountCents > MAX_CENTS) {
        return { error: "Enter an amount between 0.00 and 100000.00.", code: 400 };
    }
    if (amountCents < snapshot.cents) {
        return { error: `${formatCents(amountCents)} does not cover the pending ${formatCents(snapshot.cents)}. Partial payments are not supported.`, code: 400 };
    }
    if (reference !== undefined && typeof reference !== "string") {
        return { error: "Invalid payment reference.", code: 400 };
    }
    const trimmedReference = reference?.trim().slice(0, 200) || null;
    const where = { userId, status: "PENDING" as const, date: { lte: latest } };

    try {
        await db.$transaction(async (tx) => {
            const current = await tx.order.aggregate({
                where,
                _count: { _all: true },
                _sum: { priceCents: true },
            });
            if (current._count._all !== snapshot.count || (current._sum.priceCents ?? 0) !== snapshot.cents) {
                throw new OrdersChangedError();
            }

            const payment = await tx.payment.create({
                data: {
                    userId,
                    amountCents,
                    ordersCents: snapshot.cents,
                    reference: trimmedReference,
                    confirmedById: admin.id,
                },
            });

            // The status condition makes a concurrent second recording of the
            // same orders update nothing, which rolls it back.
            const settled = await tx.order.updateMany({
                where,
                data: { status: "COMPLETED", paymentId: payment.id },
            });
            if (settled.count !== snapshot.count) {
                throw new OrdersChangedError();
            }
        });

        revalidatePath("/admin");
        revalidatePath("/dashboard");

        const extra = amountCents - snapshot.cents;
        const note = extra === 0 ? "" : ` Received ${formatCents(extra)} more than the orders total.`;
        return { success: `Payment recorded for ${snapshot.count} order${snapshot.count === 1 ? "" : "s"}.${note}`, code: 200 };
    } catch (error) {
        if (error instanceof OrdersChangedError) {
            return { error: "These orders changed in the meantime. Reload the page and check again.", code: 409 };
        }
        console.error("[recordPayment] failed:", error);
        return { error: "Failed to record the payment.", code: 500 };
    }
};
