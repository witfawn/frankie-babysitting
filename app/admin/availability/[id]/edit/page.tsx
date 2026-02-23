"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EditAvailabilityPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  useEffect(() => {
    fetch(`/api/availability/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        const startDate = new Date(data.startTime);
        const endDate = new Date(data.endTime);
        const date = new Date(data.date);
        
        setFormData({
          date: format(date, "yyyy-MM-dd"),
          startTime: format(startDate, "HH:mm"),
          endTime: format(endDate, "HH:mm"),
          notes: data.notes || "",
        });
        setFetching(false);
      })
      .catch(() => {
        toast.error("Failed to load availability");
        router.push("/admin/availability");
      });
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const date = new Date(formData.date);
      const [startHours, startMinutes] = formData.startTime.split(":");
      const [endHours, endMinutes] = formData.endTime.split(":");

      const startTime = new Date(date);
      startTime.setHours(parseInt(startHours), parseInt(startMinutes));

      const endTime = new Date(date);
      endTime.setHours(parseInt(endHours), parseInt(endMinutes));

      const response = await fetch(`/api/availability/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date.toISOString(),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        toast.success("Availability updated successfully!");
        router.push("/admin/availability");
      } else {
        throw new Error("Failed to update availability");
      }
    } catch (error) {
      toast.error("Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this availability?")) {
      return;
    }

    try {
      const response = await fetch(`/api/availability/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Availability deleted successfully");
        router.push("/admin/availability");
      } else {
        throw new Error("Failed to delete availability");
      }
    } catch (error) {
      toast.error("Failed to delete availability");
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4">
          <Link href="/admin/availability">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-bold">Edit Availability</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Availability</CardTitle>
            <CardDescription>Update this availability window</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
