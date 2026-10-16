import { NextRequest, NextResponse } from "next/server";
import { registerUserSchema } from "@/lib/validators";
import { DEMO_USERS, hashPassword } from "@/lib/auth";
import { verifyOtp } from "@/lib/otp";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerUserSchema.parse(body);

    const email = validated.email.trim().toLowerCase();

    if (DEMO_USERS[email]) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Require and verify the 6-digit OTP
    if (!validated.otp) {
      return NextResponse.json(
        { error: "Verification code (OTP) is required to complete registration." },
        { status: 400 }
      );
    }

    const verificationResult = verifyOtp(email, validated.otp);
    if (!verificationResult.valid) {
      return NextResponse.json(
        { error: verificationResult.reason || "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(validated.password);

    const formattedPhone = validated.privatePhone
      ? `${validated.countryCode || "+1"} ${validated.privatePhone.trim()}`
      : null;

    const newUser = {
      id: `usr-${Date.now()}`,
      email,
      name: validated.contactPersonName,
      role: validated.role,
      organizationName: validated.organizationName || null,
      privatePhone: formattedPhone,
      emailVerified: new Date().toISOString(),
      passwordHash,
    };

    DEMO_USERS[email] = newUser;

    // Persist to Neon PostgreSQL if database connection and tables exist
    try {
      if (prisma && prisma.user) {
        const dbUser = await prisma.user.create({
          data: {
            email,
            passwordHash,
            role: validated.role,
            contactPersonName: validated.contactPersonName,
            organizationName: validated.organizationName || null,
            privatePhone: formattedPhone,
            emailVerified: new Date(),
            termsAcceptedAt: new Date(),
            privacyAcceptedAt: new Date(),
          },
        });
        if (dbUser?.id) {
          newUser.id = dbUser.id;
        }
      }
    } catch (dbErr) {
      console.warn("[REPASTERS] Neon DB write notice (make sure 'npx prisma db push' has been run):", dbErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Your email has been verified.",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          organizationName: newUser.organizationName,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Invalid registration data";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
