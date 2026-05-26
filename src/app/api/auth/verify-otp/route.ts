import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { redis } from "@/lib/redis";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { email, otp } = parsed.data;
    const otpKey = `otp:${email}`;
    const storedOtp = await redis.get(otpKey);

    if (!storedOtp) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (storedOtp !== otp) {
      return NextResponse.json(
        { error: "Incorrect verification code. Please try again." },
        { status: 400 }
      );
    }

    // OTP is valid — delete it immediately (single-use)
    await redis.del(otpKey);

    // Issue a short-lived verification token so the register endpoint can trust this email
    const verifiedKey = `verified_email:${email}`;
    await redis.set(verifiedKey, "1", "EX", 300); // 5 minutes to complete registration

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("[VERIFY_OTP ERROR]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
