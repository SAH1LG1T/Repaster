import { NextRequest, NextResponse } from "next/server";
import { DEMO_USERS, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);
    const email = validated.email.trim().toLowerCase();

    let user: any = null;

    // 1. Attempt lookup in Neon PostgreSQL via Prisma
    try {
      if (prisma && prisma.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email },
        });
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.contactPersonName || "Community Member",
            role: dbUser.role,
            organizationName: dbUser.organizationName,
            passwordHash: dbUser.passwordHash,
          };
        }
      }
    } catch (dbErr) {
      console.warn("[REPASTERS] DB query fallback on login:", dbErr);
    }

    // 2. Fallback to in-memory store
    if (!user && DEMO_USERS[email]) {
      const demo = DEMO_USERS[email];
      user = {
        id: demo.id,
        email: demo.email,
        name: demo.name,
        role: demo.role,
        organizationName: demo.organizationName,
        passwordHash: demo.passwordHash,
      };
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    const passwordMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationName: user.organizationName,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
