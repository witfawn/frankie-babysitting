import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, User, MapPin } from "lucide-react";
import { formatDate, formatTime } from "@/lib/timezone";
import { AdminNav } from "@/components/admin-nav";
import { BookingActions } from "@/components/booking-actions";
import { DeleteBookingButton } from "@/components/delete-booking-button";

async function getBookings() {
  return await prisma.booking.findMany({
    include: {
      availability: true,
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const bookings = await getBookings();
  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const otherBookings = bookings.filter((b) => !["PENDING", "CONFIRMED"].includes(b.status));

  // Set default tab based on query param
  const defaultTab = searchParams?.status === "CONFIRMED" ? "confirmed" : 
                     searchParams?.status === "PENDING" ? "pending" : "pending";

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">All Bookings</h1>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({confirmedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({bookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showActions />
            ))}
            {pendingBookings.length === 0 && (
              <p className="text-center text-slate-500 py-8">No pending bookings</p>
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            {confirmedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
            {confirmedBookings.length === 0 && (
              <p className="text-center text-slate-500 py-8">No confirmed bookings</p>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                showActions={booking.status === "PENDING"}
              />
            ))}
            {bookings.length === 0 && (
              <p className="text-center text-slate-500 py-8">No bookings yet</p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function BookingCard({
  booking,
  showActions = false,
}: {
  booking: any;
  showActions?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-medium text-lg">
              {booking.parent.name || booking.parent.email}
            </p>
            <p className="text-sm text-slate-500">{booking.parent.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                booking.status === "CONFIRMED"
                  ? "default"
                  : booking.status === "PENDING"
                  ? "secondary"
                  : "destructive"
              }
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
            <DeleteBookingButton bookingId={booking.id} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-slate-500">Date</p>
            <p className="font-medium">
              {formatDate(booking.availability.date)}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Time</p>
            <p className="font-medium">
              {formatTime(booking.requestedStart)} - {formatTime(booking.requestedEnd)}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Kids</p>
            <p className="font-medium">
              {booking.numKids} kid(s), ages {booking.kidsAges}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Address</p>
            <p className="font-medium truncate">{booking.address}</p>
          </div>
        </div>

        <div className="text-sm mb-4">
          <p className="text-slate-500">Emergency Contact</p>
          <p className="font-medium">
            {booking.emergencyName} - {booking.emergencyPhone}
          </p>
        </div>

        {booking.notes && (
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded mb-4">
            <span className="font-medium">Notes:</span> {booking.notes}
          </p>
        )}

        {showActions && <BookingActions bookingId={booking.id} />}
      </CardContent>
    </Card>
  );
}
