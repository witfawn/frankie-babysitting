"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { ParentNav } from "@/components/parent-nav";

export default function BookPage({ params }: { params: { availabilityId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    numKids: "1",
    kidsAges: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
    notes: "",
  });

  useEffect(() => {
    // Fetch availability details
    fetch(`/api/availability/${params.availabilityId}`)
      .then((res) => res.json())
      .then((data) => setAvailability(data));

    // Fetch user profile for pre-filling
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setFormData((prev) => ({
          ...prev,
          address: data.address || "",
          kidsAges: data.kidsAges || "",
          emergencyName: data.emergencyName || "",
          emergencyPhone: data.emergencyPhone || "",
        }));
      });
  }, [params.availabilityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const date = new Date(availability.date);
      const [startHours, startMinutes] = formData.startTime.split(":");
      const [endHours, endMinutes] = formData.endTime.split(":");

      const requestedStart = new Date(date);
      requestedStart.setHours(parseInt(startHours), parseInt(startMinutes));

      const requestedEnd = new Date(date);
      requestedEnd.setHours(parseInt(endHours), parseInt(endMinutes));

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availabilityId: params.availabilityId,
          requestedStart: requestedStart.toISOString(),
          requestedEnd: requestedEnd.toISOString(),
          numKids: parseInt(formData.numKids),
          kidsAges: formData.kidsAges,
          address: formData.address,
          emergencyName: formData.emergencyName,
          emergencyPhone: formData.emergencyPhone,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        toast.success("Booking request submitted!");
        router.push("/parent/bookings");
      } else {
        throw new Error("Failed to submit booking");
      }
    } catch (error) {
      toast.error("Failed to submit booking request");
    } finally {
      setLoading(false);
    }
  };

  if (!availability) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ParentNav />
        <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ParentNav />
      
      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Link href="/parent/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Booking</CardTitle>
            <CardDescription>
              Request a time slot within Frankie&apos;s availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Availability Summary */}
            <div className="bg-pink-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-pink-600" />
                <span className="font-medium text-pink-900">
                  {format(new Date(availability.date), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-pink-700">
                <Clock className="w-4 h-4" />
                <span>
                  Available: {format(new Date(availability.startTime), "h:mm a")} -{" "}
                  {format(new Date(availability.endTime), "h:mm a")}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
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
                  <Label htmlFor="endTime">End Time *</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numKids">Number of Kids *</Label>
                  <Input
                    id="numKids"
                    type="number"
                    min="1"
                    required
                    value={formData.numKids}
                    onChange={(e) =>
                      setFormData({ ...formData, numKids: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kidsAges">Kids&apos; Ages *</Label>
                  <Input
                    id="kidsAges"
                    placeholder="e.g., 3, 5"
                    required
                    value={formData.kidsAges}
                    onChange={(e) =>
                      setFormData({ ...formData, kidsAges: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="Your address"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Emergency Contact Name *</Label>
                  <Input
                    id="emergencyName"
                    placeholder="Name"
                    required
                    value={formData.emergencyName}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    placeholder="Phone number"
                    required
                    value={formData.emergencyPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyPhone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or notes..."
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
                {loading ? "Submitting..." : "Request Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
