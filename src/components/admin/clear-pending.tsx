"use client";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

import { clearPendingOrders } from "@/actions/clear-pending";
import { useState } from "react";


interface ClearPendingProps {
  userid: string;
}
export const ClearPending = ({ userid }: ClearPendingProps) => {
  const [loading, setLoading] = useState(false);

  const handleClearPending = async () => {
    setLoading(true);
    try {
      const result = await clearPendingOrders(userid);
      if (result.success) {
        toast.success(result.success);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to clear pending orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClearPending} disabled={loading}>
      {loading ? "Clearing..." : "Clear Pending Orders"}
    </Button>
  );
};