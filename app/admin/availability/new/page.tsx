"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

export default function NewAvailabilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get("duplicate");
  const [loading, setLoading] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  // Fetch availability data if duplicating
  useEffect(() => {
    if (duplicateId) {
      setIsDuplicating(true);
      fetch(`/api/availability/${duplicateId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            // Extract time from ISO strings
            const startDate = new Date(data.startTime);
            const endDate = new Date(data.endTime);
            
            setFormData({
              date: "", // Leave date empty so they can pick new one
              startTime: format(startDate, "HH:mm"),
              endTime: format(endDate, "HH:mm"),
              notes: data.notes || "",
            });
          }
        })
        .catch(() => {
          toast.error("Failed to load availability for duplication");
        })
        .finally(() => {
          setIsDuplicating(false);
        });
    }
  }, [duplicateId]);

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

      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date.toISOString(),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        toast.success(duplicateId ? "Availability duplicated successfully!" : "Availability created successfully!");
        router.push("/admin/dashboard");
      } else {
        throw new Error("Failed to create availability");
      }
    } catch (error) {
      toast.error("Failed to create availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-bold">
            {duplicateId ? "Duplicate Availability" : "Add Availability"}
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {duplicateId && <Copy className="w-5 h-5" />}
              {duplicateId ? "Duplicate Availability" : "Create New Availability"}
            </CardTitle>
            <CardDescription>
              {duplicateId 
                ? "Review and edit the duplicated availability before saving"
                : "Set up a new time window when you're available for babysitting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDuplicating ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date {duplicateId && "(select new date)"}
                  </Label>
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
                    placeholder="Any special notes about this availability..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  disabled={loading}
                >
                  {loading 
                    ? (duplicateId ? "Duplicating..." : "Creating...") 
                    : (duplicateId ? "Create Duplicate" : "Create Availability")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
