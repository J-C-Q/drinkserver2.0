"use client";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recordPayment } from "@/actions/record-payment";
import { formatCents } from "@/lib/money";

interface RecordPaymentProps {
  userId: string;
  // The pending orders shown on the page; only these are settled.
  orderIds: string[];
  pendingCents: number;
}

// "12,50" or "12.5" -> 1250; null if it is not a valid amount.
const parseEuros = (value: string) => {
  const match = value.trim().replace(",", ".").match(/^(\d{1,6})(?:\.(\d{1,2}))?$/);
  if (!match) {
    return null;
  }
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
};

export const RecordPayment = ({ userId, orderIds, pendingCents }: RecordPaymentProps) => {
  const [amount, setAmount] = useState(formatCents(pendingCents));
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRecord = async () => {
    const amountCents = parseEuros(amount);
    if (amountCents === null) {
      toast.error("Enter the amount received, e.g. 12.50");
      return;
    }
    setLoading(true);
    try {
      const result = await recordPayment(userId, orderIds, amountCents, reference);
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
        className="sm:w-32 text-black"
      />
      <Input
        aria-label="Payment reference (optional)"
        placeholder="PayPal reference (optional)"
        value={reference}
        maxLength={200}
        onChange={(event) => setReference(event.target.value)}
        className="text-black"
      />
      <Button onClick={handleRecord} disabled={loading}>
        {loading ? "Recording..." : `Record payment for ${orderIds.length} order${orderIds.length === 1 ? "" : "s"}`}
      </Button>
    </div>
  );
};
