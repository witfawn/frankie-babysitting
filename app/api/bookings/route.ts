import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: session.user.role === "ADMIN" ? {} : { parentId: session.user.id },
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

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      availabilityId,
      requestedStart,
      requestedEnd,
      numKids,
      kidsAges,
      address,
      emergencyName,
      emergencyPhone,
      notes,
    } = body;

    // Check if user has saved profile info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const booking = await prisma.booking.create({
      data: {
        availabilityId,
        parentId: session.user.id,
        requestedStart: new Date(requestedStart),
        requestedEnd: new Date(requestedEnd),
        numKids,
        kidsAges,
        address,
        emergencyName,
        emergencyPhone,
        notes,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
