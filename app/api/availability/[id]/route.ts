import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const availability = await prisma.availability.findUnique({
      where: { id },
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const availability = await prisma.availability.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error updating availability:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    await prisma.availability.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting availability:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
