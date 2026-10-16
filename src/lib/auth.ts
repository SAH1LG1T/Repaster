import bcrypt from "bcryptjs";
import type { UserRole } from "./validators";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationName?: string | null;
}

// User store (populated dynamically via registration and database)
export const DEMO_USERS: Record<string, SessionUser & { passwordHash: string }> = {};

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// In Next.js App Router, retrieves current authenticated user dynamically from cookie
export async function getSession(): Promise<{ user: SessionUser } | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("repasters_user");
    if (userCookie?.value) {
      const parsed = JSON.parse(decodeURIComponent(userCookie.value));
      if (parsed?.email && parsed?.role) {
        return { user: parsed };
      }
    }
  } catch {
    // Non-request or build context
  }
  return null;
}

export function hasRole(user: SessionUser | null | undefined, allowedRoles: UserRole[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
