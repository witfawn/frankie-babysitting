import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/timezone";
import { AdminNav } from "@/components/admin-nav";
import { DeleteAvailabilityButton } from "@/components/delete-availability-button";

async function getAllAvailability() {
  return await prisma.availability.findMany({
    orderBy: { date: "desc" },
    include: {
      bookings: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
      },
    },
  });
}

export default async function AdminAvailabilityPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const availability = await getAllAvailability();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">All Availability</h1>
          <Link href="/admin/availability/new">
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Availability
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {availability.map((avail) => (
            <Card key={avail.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/admin/availability/${avail.id}`}>
                      <p className="font-medium text-lg hover:text-pink-600 transition-colors">
                        {formatDate(avail.date)}
                      </p>
                    </Link>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatTime(avail.startTime)} - {formatTime(avail.endTime)}
                    </p>
                    {avail.notes && (
                      <p className="text-sm text-slate-600 mt-2">{avail.notes}</p>
                    )}
                    {avail.bookings.length > 0 && (
                      <Badge variant="secondary" className="mt-2">
                        {avail.bookings.length} booking{avail.bookings.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={avail.status === "OPEN" ? "default" : "secondary"}
                      className={avail.status === "OPEN" ? "bg-green-100 text-green-800" : ""}
                    >
                      {avail.status}
                    </Badge>
                    
                    <Link href={`/admin/availability/${avail.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    <Link href={`/admin/availability/new?duplicate=${avail.id}`}>
                      <Button variant="ghost" size="icon">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    <DeleteAvailabilityButton availabilityId={avail.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {availability.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500">No availability posted yet.</p>
                <Link href="/admin/availability/new">
                  <Button className="mt-4 bg-pink-600 hover:bg-pink-700">
                    Add Your First Availability
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
