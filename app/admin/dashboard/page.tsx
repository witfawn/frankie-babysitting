import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, DollarSign, Plus } from "lucide-react";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/timezone";
import { AdminNav } from "@/components/admin-nav";

async function getStats() {
  const [totalBookings, pendingBookings, confirmedBookings, totalAvailability] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.availability.count(),
  ]);

  return { totalBookings, pendingBookings, confirmedBookings, totalAvailability };
}

async function getRecentAvailability() {
  return await prisma.availability.findMany({
    take: 5,
    orderBy: { date: "desc" },
    include: {
      bookings: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
      },
    },
  });
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const stats = await getStats();
  const recentAvailability = await getRecentAvailability();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <Link href="/admin/availability/new">
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Availability
            </Button>
          </Link>
        </div>

        {/* Stats Grid - Clickable Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/bookings">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="w-4 h-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/bookings?status=PENDING">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="w-4 h-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/bookings?status=CONFIRMED">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <Users className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.confirmedBookings}</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/availability">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Availability</CardTitle>
                <Calendar className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAvailability}</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Availability</CardTitle>
            <CardDescription>Your recently posted availability windows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAvailability.map((avail) => (
                <Link
                  key={avail.id}
                  href={`/admin/availability/${avail.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {formatDate(avail.date)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatTime(avail.startTime)} - {formatTime(avail.endTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {avail.bookings.length > 0 && (
                      <Badge variant="secondary">
                        {avail.bookings.length} booking{avail.bookings.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    <Badge
                      variant={avail.status === "OPEN" ? "default" : "secondary"}
                      className={avail.status === "OPEN" ? "bg-green-100 text-green-800" : ""}
                    >
                      {avail.status}
                    </Badge>
                  </div>
                </Link>
              ))}
              {recentAvailability.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  No availability posted yet. Click &quot;Add Availability&quot; to get started!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
