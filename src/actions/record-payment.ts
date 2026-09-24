"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { currentAdmin } from "@/lib/auth-guard";
import { formatCents } from "@/lib/money";

type PaymentResult = { success?: string; error?: string; code: number };

class OrdersChangedError extends Error {}

// Records a payment an admin received and settles exactly the given orders.
// orderIds are the pending orders the admin saw; orders placed afterwards stay
// pending, and nothing is settled if any of the given orders already changed.
export const recordPayment = async (
    userId: string,
    orderIds: string[],
    amountCents: number,
    reference?: string,
): Promise<PaymentResult> => {
    const admin = await currentAdmin();
    if (!admin) {
        return { error: "You are not authorized to perform this action!", code: 403 };
    }

    // Server action arguments are not type-checked at runtime.
    if (
        typeof userId !== "string" || userId === "" ||
        !Array.isArray(orderIds) || orderIds.length === 0 || orderIds.length > 1000 ||
        orderIds.some((id) => typeof id !== "string" || id === "")
    ) {
        return { error: "Invalid payment details.", code: 400 };
    }
    if (!Number.isInteger(amountCents) || amountCents < 0 || amountCents > 100_000_00) {
        return { error: "Enter an amount between 0.00 and 100000.00.", code: 400 };
    }
    if (reference !== undefined && typeof reference !== "string") {
        return { error: "Invalid payment reference.", code: 400 };
    }
    const trimmedReference = reference?.trim().slice(0, 200) || null;
    const ids = Array.from(new Set(orderIds));

    try {
        const ordersCents = await db.$transaction(async (tx) => {
            const orders = await tx.order.findMany({
                where: { orderId: { in: ids }, userId, status: "PENDING" },
                select: { priceCents: true },
            });
            if (orders.length !== ids.length) {
                throw new OrdersChangedError();
            }
            const total = orders.reduce((sum, order) => sum + order.priceCents, 0);

            const payment = await tx.payment.create({
                data: {
                    userId,
                    amountCents,
                    ordersCents: total,
                    reference: trimmedReference,
                    confirmedById: admin.id,
                },
            });

            // The status condition makes a concurrent second recording of the
            // same orders update nothing, which rolls it back.
            const settled = await tx.order.updateMany({
                where: { orderId: { in: ids }, userId, status: "PENDING" },
                data: { status: "COMPLETED", paymentId: payment.id },
            });
            if (settled.count !== ids.length) {
                throw new OrdersChangedError();
            }
            return total;
        });

        revalidatePath("/admin");
        revalidatePath("/dashboard");

        const difference = amountCents - ordersCents;
        const note = difference === 0
            ? ""
            : ` Received ${formatCents(amountCents)} for orders totalling ${formatCents(ordersCents)} (${difference > 0 ? "+" : ""}${formatCents(difference)}).`;
        return { success: `Payment recorded for ${ids.length} order${ids.length === 1 ? "" : "s"}.${note}`, code: 200 };
    } catch (error) {
        if (error instanceof OrdersChangedError) {
            return { error: "These orders changed in the meantime. Reload the page and check again.", code: 409 };
        }
        console.error("[recordPayment] failed:", error);
        return { error: "Failed to record the payment.", code: 500 };
    }
};
