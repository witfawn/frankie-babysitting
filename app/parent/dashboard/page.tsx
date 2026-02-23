import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Baby } from "lucide-react";
import Link from "next/link";
import { isAfter, startOfDay } from "date-fns";
import { formatDate, formatTime } from "@/lib/timezone";
import { ParentNav } from "@/components/parent-nav";

async function getAvailability() {
  const today = startOfDay(new Date());
  return await prisma.availability.findMany({
    where: {
      date: {
        gte: today,
      },
      status: "OPEN",
    },
    orderBy: { date: "asc" },
    include: {
      bookings: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
      },
    },
  });
}

async function getMyBookings(userId: string) {
  return await prisma.booking.findMany({
    where: { parentId: userId },
    include: { availability: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}

export default async function ParentDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const availability = await getAvailability();
  const myBookings = await getMyBookings(session.user.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <ParentNav />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome!</h1>
        <p className="text-slate-500 mb-8">Find availability and book your babysitting session</p>

        {/* My Recent Bookings */}
        {myBookings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>My Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {formatDate(booking.availability.date)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatTime(booking.requestedStart)} - {formatTime(booking.requestedEnd)}
                      </p>
                    </div>
                    <Badge
                      variant={booking.status === "CONFIRMED" ? "default" : "secondary"}
                      className={
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <Link href="/parent/bookings">
                <Button variant="link" className="mt-4 p-0">
                  View all bookings
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Available Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Available Dates</CardTitle>
            <CardDescription>Book a time that works for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availability.map((avail) => (
                <div
                  key={avail.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                >
                  <div>
                    <p className="font-medium">
                      {formatDate(avail.date)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatTime(avail.startTime)} - {formatTime(avail.endTime)}
                    </p>
                    {avail.notes && (
                      <p className="text-sm text-slate-400 mt-1">{avail.notes}</p>
                    )}
                  </div>
                  <Link href={`/parent/book/${avail.id}`}>
                    <Button className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto">
                      <Baby className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                  </Link>
                </div>
              ))}
              {availability.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No availability at the moment</p>
                  <p className="text-sm text-slate-400">Check back soon!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
