"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParentNav } from "@/components/parent-nav";
import { Gift, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ReferPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Invitation sent!");
        setSuccess(true);
        setEmail("");
      } else {
        throw new Error("Failed to send invitation");
      }
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ParentNav />
      
      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Refer a Friend</h1>
        <p className="text-slate-500 mb-8">
          Invite your friends to use Frankie&apos;s babysitting service
        </p>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-pink-600" />
            </div>
            <CardTitle>Share the Love</CardTitle>
            <CardDescription>
              When you refer a friend, they&apos;ll get instant access to book with Frankie.
              No waiting list needed!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Invitation Sent!</h3>
                <p className="text-slate-500 mb-6">
                  Your friend will receive an email invitation and can sign up immediately.
                </p>
                <Button
                  onClick={() => setSuccess(false)}
                  variant="outline"
                  className="w-full"
                >
                  Refer Another Friend
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Friend&apos;s Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="friend@example.com"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Invitation"}
                </Button>

                <p className="text-sm text-slate-500 text-center">
                  Your friend will be auto-whitelisted and can sign in with Google
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
