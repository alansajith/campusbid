import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { isEduEmail, extractUniversityFromEmail } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().min(10).max(20),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input data." },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;

    // Educational email enforcement
    if (!isEduEmail(email)) {
      return NextResponse.json(
        { error: "Only official college/university email addresses are allowed." },
        { status: 400 }
      );
    }

    // Ensure OTP was successfully verified for this email
    const verifiedKey = `verified_email:${email}`;
    const isEmailVerified = await redis.get(verifiedKey);
    if (!isEmailVerified) {
      return NextResponse.json(
        { error: "Email not verified. Please complete the OTP verification step first." },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const university = extractUniversityFromEmail(email);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        university,
        phone,
        verified: true, // Email ownership confirmed via OTP
      },
      select: {
        id: true,
        name: true,
        email: true,
        university: true,
        phone: true,
      },
    });

    // Clean up the verification token
    await redis.del(verifiedKey);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

