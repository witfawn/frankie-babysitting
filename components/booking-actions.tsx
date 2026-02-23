"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function BookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "confirm" | "decline") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "confirm" ? "CONFIRMED" : "DECLINED",
        }),
      });

      if (response.ok) {
        toast.success(`Booking ${action}ed successfully!`);
        router.refresh();
      } else {
        throw new Error("Failed to update booking");
      }
    } catch (error) {
      toast.error("Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleAction("confirm")}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700"
        size="sm"
      >
        Approve
      </Button>
      <Button
        onClick={() => handleAction("decline")}
        disabled={loading}
        variant="destructive"
        size="sm"
      >
        Decline
      </Button>
    </div>
  );
}
