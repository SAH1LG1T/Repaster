import { NextRequest, NextResponse } from "next/server";
import { sendOtpSchema } from "@/lib/validators";
import { DEMO_USERS } from "@/lib/auth";
import { generateOrGetOtp } from "@/lib/otp";
import { sendVerificationOtpEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = sendOtpSchema.parse(body);

    const email = validated.email.trim().toLowerCase();

    // Check if account already registered
    if (DEMO_USERS[email]) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Generate or retrieve current active 30-min OTP
    const { code, remainingMinutes } = generateOrGetOtp(email);

    // Send email (or log to terminal in dev mode)
    await sendVerificationOtpEmail({
      email,
      otp: code,
      recipientName: validated.contactPersonName || "Community Member",
      remainingMinutes,
    });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${email}. Valid for ${remainingMinutes} minutes.`,
      remainingMinutes,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to send verification code";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
