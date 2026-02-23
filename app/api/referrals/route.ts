import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { email } = body;

    // Check if user is already whitelisted/referred
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User already has access", { status: 400 });
    }

    // Check if already referred
    const existingReferral = await prisma.referral.findFirst({
      where: { referredEmail: email },
    });

    if (existingReferral) {
      return new NextResponse("Already referred", { status: 400 });
    }

    // Create referral and whitelist user
    const [referral] = await prisma.$transaction([
      prisma.referral.create({
        data: {
          referrerId: session.user.id,
          referredEmail: email,
          status: "ACCEPTED", // Auto-accept since they're being invited
        },
      }),
      prisma.user.create({
        data: {
          email,
          role: "PARENT",
          emailVerified: new Date(), // Auto-verify
        },
      }),
    ]);

    return NextResponse.json(referral);
  } catch (error) {
    console.error("Error creating referral:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(referrals);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
