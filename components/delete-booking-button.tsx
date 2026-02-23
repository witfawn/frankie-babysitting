"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteBookingButtonProps {
  bookingId: string;
  variant?: "icon" | "button";
  onDeleted?: () => void;
}

export function DeleteBookingButton({ 
  bookingId, 
  variant = "icon",
  onDeleted 
}: DeleteBookingButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this booking? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Booking deleted successfully");
        if (onDeleted) {
          onDeleted();
        } else {
          window.location.reload();
        }
      } else {
        throw new Error("Failed to delete booking");
      }
    } catch (error) {
      toast.error("Failed to delete booking");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "button") {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
