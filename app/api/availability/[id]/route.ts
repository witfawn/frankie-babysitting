import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const availability = await prisma.availability.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          where: { status: { in: ["PENDING", "CONFIRMED"] } },
        },
      },
    });

    if (!availability) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
