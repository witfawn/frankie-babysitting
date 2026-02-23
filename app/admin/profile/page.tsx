"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminNav } from "@/components/admin-nav";
import { toast } from "sonner";

export default function AdminProfilePage() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const update = sessionData?.update;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    hourlyRate: "",
    phone: "",
  });

  useEffect(() => {
    if (session?.user) {
      fetch("/api/users/profile")
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            name: data.name || "",
            bio: data.bio || "",
            hourlyRate: data.hourlyRate?.toString() || "",
            phone: data.phone || "",
          });
        });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          hourlyRate: parseFloat(formData.hourlyRate) || 0,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        update();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      
      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information that parents will see
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell parents about yourself..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    setFormData({ ...formData, hourlyRate: e.target.value })
                  }
                  placeholder="25.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Your phone number"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
