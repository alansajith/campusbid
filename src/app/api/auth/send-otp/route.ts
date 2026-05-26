import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { sendOtpEmail } from "@/lib/email";
import { isEduEmail, extractUniversityFromEmail } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
});

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const OTP_TTL_SECONDS = 600; // 10 minutes
const RATE_LIMIT_TTL_SECONDS = 60; // 1 minute between resends

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const { email } = parsed.data;

    if (!isEduEmail(email)) {
      return NextResponse.json(
        { error: "Only official college/university email addresses (.edu, .ac.in, etc.) are allowed." },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Rate limiting: prevent spamming resend
    const rateLimitKey = `otp_ratelimit:${email}`;
    const isRateLimited = await redis.get(rateLimitKey);
    if (isRateLimited) {
      return NextResponse.json(
        { error: "Please wait at least 60 seconds before requesting another code." },
        { status: 429 }
      );
    }

    // Generate and store OTP
    const otp = generateOtp();
    const otpKey = `otp:${email}`;
    await redis.set(otpKey, otp, "EX", OTP_TTL_SECONDS);
    await redis.set(rateLimitKey, "1", "EX", RATE_LIMIT_TTL_SECONDS);

    // Send email
    const university = extractUniversityFromEmail(email);
    let devBypass = false;
    try {
      await sendOtpEmail(email, otp, university);
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`\n[DEV BYPASS] Resend failed to send OTP email to ${email} due to: ${err.message}`);
        console.warn(`>>> YOUR DEV OTP IS: ${otp} <<<\n`);
        devBypass = true;
      } else {
        throw err;
      }
    }

    return NextResponse.json({
      success: true,
      ...(devBypass ? { devBypass: true, otp } : {})
    });
  } catch (error) {
    console.error("[SEND_OTP ERROR]", error);
    return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 });
  }
}
