import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin-nav";
import { format } from "date-fns";

async function getReferrals() {
  return await prisma.referral.findMany({
    include: {
      referrer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminReferralsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const referrals = await getReferrals();
  const pendingReferrals = referrals.filter((r) => r.status === "PENDING");
  const acceptedReferrals = referrals.filter((r) => r.status === "ACCEPTED");

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Referrals</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referrals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReferrals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acceptedReferrals.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Referrals</CardTitle>
            <CardDescription>Track who invited whom</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{referral.referredEmail}</p>
                    <p className="text-sm text-slate-500">
                      Referred by {referral.referrer.name || referral.referrer.email}
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(referral.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge
                    variant={referral.status === "ACCEPTED" ? "default" : "secondary"}
                    className={
                      referral.status === "ACCEPTED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {referral.status}
                  </Badge>
                </div>
              ))}
              {referrals.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  No referrals yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
