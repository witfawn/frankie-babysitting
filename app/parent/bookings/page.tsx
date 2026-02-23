import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, Phone } from "lucide-react";
import { formatDate, formatTime, formatDateTime } from "@/lib/timezone";
import { ParentNav } from "@/components/parent-nav";

async function getMyBookings(userId: string) {
  return await prisma.booking.findMany({
    where: { parentId: userId },
    include: { availability: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ParentBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const bookings = await getMyBookings(session.user.id);
  const upcomingBookings = bookings.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.availability.date) >= new Date()
  );
  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const pastBookings = bookings.filter(
    (b) => b.status === "COMPLETED" || new Date(b.availability.date) < new Date()
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <ParentNav />
      
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Bookings</h1>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
            {upcomingBookings.length === 0 && (
              <p className="text-center text-slate-500 py-8">No upcoming bookings</p>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
            {pendingBookings.length === 0 && (
              <p className="text-center text-slate-500 py-8">No pending bookings</p>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
            {pastBookings.length === 0 && (
              <p className="text-center text-slate-500 py-8">No past bookings</p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function BookingCard({ booking }: { booking: any }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-medium text-lg">
              {formatDate(booking.availability.date)}
            </p>
            <p className="text-sm text-slate-500">
              Booked on {formatDateTime(booking.createdAt)}
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

        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              {formatTime(booking.requestedStart)} - {formatTime(booking.requestedEnd)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Kids:</span>
            <span>
              {booking.numKids} kid(s), ages {booking.kidsAges}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="truncate">{booking.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>{booking.emergencyPhone}</span>
          </div>
        </div>

        {booking.notes && (
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
            <span className="font-medium">Notes:</span> {booking.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
