// In-memory OTP storage with 30-minute validity
// Maintains the same OTP for 30 minutes as requested

interface OtpRecord {
  code: string;
  expiresAt: number; // timestamp in ms
  createdAt: number;
}

// Global store to persist across hot reloads in Next.js development
const globalForOtp = globalThis as unknown as {
  repastersOtpStore?: Map<string, OtpRecord>;
};

const otpStore: Map<string, OtpRecord> =
  globalForOtp.repastersOtpStore ?? new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== "production") {
  globalForOtp.repastersOtpStore = otpStore;
}

export const OTP_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Returns the existing valid OTP if still within the 30-minute window,
 * otherwise generates a new 6-digit OTP valid for 30 minutes.
 */
export function generateOrGetOtp(email: string): { code: string; isNew: boolean; remainingMinutes: number } {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = otpStore.get(normalizedEmail);
  const now = Date.now();

  if (existing && now < existing.expiresAt) {
    const remainingMinutes = Math.ceil((existing.expiresAt - now) / 60000);
    return {
      code: existing.code,
      isNew: false,
      remainingMinutes,
    };
  }

  // Generate secure 6-digit random OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + OTP_EXPIRY_MS;

  otpStore.set(normalizedEmail, {
    code,
    expiresAt,
    createdAt: now,
  });

  return {
    code,
    isNew: true,
    remainingMinutes: 30,
  };
}

/**
 * Validates a submitted OTP against the stored code for the given email.
 */
export function verifyOtp(email: string, code: string): { valid: boolean; reason?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);
  const now = Date.now();

  if (!record) {
    return { valid: false, reason: "No verification code found. Please request a new code." };
  }

  if (now > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { valid: false, reason: "Verification code has expired (30 minute limit). Please request a new one." };
  }

  if (record.code !== code.trim()) {
    return { valid: false, reason: "Invalid verification code. Please check and try again." };
  }

  // Consumed successfully
  otpStore.delete(normalizedEmail);
  return { valid: true };
}
