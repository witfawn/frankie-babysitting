import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, MapPin, Phone, Copy } from "lucide-react";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/timezone";
import { AdminNav } from "@/components/admin-nav";
import { BookingActions } from "@/components/booking-actions";

async function getAvailability(id: string) {
  const availability = await prisma.availability.findUnique({
    where: { id },
    include: {
      bookings: {
        include: {
          parent: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return availability;
}

export default async function AvailabilityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const availability = await getAvailability(params.id);

  if (!availability) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Availability Details */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Availability Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-medium">
                  {formatDate(availability.date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Time</p>
                <p className="font-medium">
                  {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                </p>
              </div>
              {availability.notes && (
                <div>
                  <p className="text-sm text-slate-500">Notes</p>
                  <p className="font-medium">{availability.notes}</p>
                </div>
              )}
              <div>
                <Badge
                  variant={availability.status === "OPEN" ? "default" : "secondary"}
                  className={availability.status === "OPEN" ? "bg-green-100 text-green-800" : ""}
                >
                  {availability.status}
                </Badge>
              </div>
              
              {/* Duplicate Button */}
              <Link 
                href={`/admin/availability/new?duplicate=${availability.id}`}
                className="block"
              >
                <Button variant="outline" className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Availability
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Booking Requests</CardTitle>
              <CardDescription>
                {availability.bookings.length} request{availability.bookings.length !== 1 ? "s" : ""} for this availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availability.bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{booking.parent.name || booking.parent.email}</p>
                        <p className="text-sm text-slate-500">{booking.parent.email}</p>
                      </div>
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
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>
                          {formatTime(booking.requestedStart)} - {formatTime(booking.requestedEnd)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{booking.numKids} kid(s), ages {booking.kidsAges}</span>
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
                      <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                        <span className="font-medium">Notes:</span> {booking.notes}
                      </p>
                    )}

                    {booking.status === "PENDING" && (
                      <BookingActions bookingId={booking.id} />
                    )}
                  </div>
                ))}
                {availability.bookings.length === 0 && (
                  <p className="text-center text-slate-500 py-8">
                    No booking requests yet for this availability.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
