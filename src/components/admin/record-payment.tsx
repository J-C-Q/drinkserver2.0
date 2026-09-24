"use client";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recordPayment, type PendingSnapshot } from "@/actions/record-payment";
import { formatCents, parseEuros } from "@/lib/money";

interface RecordPaymentProps {
  userId: string;
  // The pending orders shown on the page; only these are settled.
  snapshot: PendingSnapshot;
}

export const RecordPayment = ({ userId, snapshot }: RecordPaymentProps) => {
  const [amount, setAmount] = useState(formatCents(snapshot.cents));
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRecord = async () => {
    const amountCents = parseEuros(amount);
    if (amountCents === null) {
      toast.error("Enter the amount received, e.g. 12.50");
      return;
    }
    if (amountCents < snapshot.cents) {
      toast.error(`Partial payments are not supported: the pending total is ${formatCents(snapshot.cents)}.`);
      return;
    }
    setLoading(true);
    try {
      const result = await recordPayment(userId, snapshot, amountCents, reference);
      if (result.success) {
        toast.success(result.success);
        setReference("");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to record the payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-2">
      <Input
        aria-label="Amount received in euros"
        inputMode="decimal"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        className="sm:w-32 text-white"
      />
      <Input
        aria-label="Payment reference (optional)"
        placeholder="PayPal reference (optional)"
        value={reference}
        maxLength={200}
        onChange={(event) => setReference(event.target.value)}
        className="text-white"
      />
      <Button onClick={handleRecord} disabled={loading}>
        {loading ? "Recording..." : `Record payment for ${snapshot.count} order${snapshot.count === 1 ? "" : "s"}`}
      </Button>
    </div>
  );
};
