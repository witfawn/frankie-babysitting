"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteAvailabilityButton({ availabilityId }: { availabilityId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this availability? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/availability/${availabilityId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Availability deleted successfully");
        window.location.reload();
      } else {
        throw new Error("Failed to delete availability");
      }
    } catch (error) {
      toast.error("Failed to delete availability");
    } finally {
      setLoading(false);
    }
  };

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
