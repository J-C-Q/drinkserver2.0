"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

import { toast } from "sonner";

import { order } from "@/actions/order";
import { clearPendingOrders } from "@/actions/clear-pending";
import { use, useEffect, useState } from "react";


interface ClearPendingProps {
  userid: string;
}
export const ClearPending = ({ userid }: ClearPendingProps) => {
  const [loading, setLoading] = useState(false);

  const handleClearPending = async () => {
    setLoading(true);
    try {
      await clearPendingOrders(userid);
      toast.success("Pending orders cleared successfully");
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