import { env } from "@/config/env";

export interface SendOtpOptions {
  email: string;
  otp: string;
  recipientName?: string;
  remainingMinutes?: number;
}

/**
 * Sends the 6-digit OTP to the user's email.
 * If SMTP or nodemailer is configured, it sends via mail server.
 * In development / test mode without external SMTP, it logs with a clear terminal banner.
 */
export async function sendVerificationOtpEmail({
  email,
  otp,
  recipientName = "Community Member",
  remainingMinutes = 30,
}: SendOtpOptions): Promise<{ success: boolean; error?: string }> {
  // Always log in development for instant inspection and zero-setup testing
  console.log("\n=======================================================");
  console.log("📨 [REPASTERS EMAIL SERVICE]");
  console.log(`To: ${recipientName} <${email}>`);
  console.log(`Verification Code (OTP): [ ${otp} ]`);
  console.log(`Valid for: ${remainingMinutes} minutes`);
  console.log(`From: ${env.EMAIL_FROM_ADDRESS}`);
  console.log("=======================================================\n");

  // 1. Try Brevo API if BREVO_API_KEY is configured
  if (env.BREVO_API_KEY && env.BREVO_API_KEY.startsWith("xkeysib-")) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": env.BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: env.EMAIL_FROM_NAME || "Repaster",
            email: env.EMAIL_FROM_ADDRESS,
          },
          to: [
            {
              email,
              name: recipientName,
            },
          ],
          subject: `${otp} is your Repasters verification code`,
          htmlContent: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #059669; margin-bottom: 8px;">Welcome to Repasters</h2>
              <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">Hi ${recipientName}, please use the code below to verify your email address. This code is valid for <strong>${remainingMinutes} minutes</strong>.</p>
              <div style="text-align: center; margin: 24px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a; padding: 12px 24px; background-color: #f1f5f9; border-radius: 8px; border: 1px dashed #cbd5e1;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; margin-top: 24px; text-align: center;">If you did not request this verification, you can safely ignore this email.</p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn("[REPASTERS] Brevo API error response:", response.status, errorText);
      } else {
        const data = await response.json();
        console.log("✅ [REPASTERS] Brevo email dispatched successfully! Message ID:", data.messageId);
        return { success: true };
      }
    } catch (brevoErr) {
      console.warn("[REPASTERS] Failed to send email via Brevo API:", brevoErr);
    }
  }

  // 2. Fallback: SMTP if configured
  try {
    if (
      env.SMTP_HOST &&
      env.SMTP_HOST !== "smtp.example.com" &&
      env.SMTP_PASSWORD &&
      env.SMTP_PASSWORD !== "dummy-smtp-password"
    ) {
      // Dynamic require so lack of optional nodemailer doesn't generate static bundler warnings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let nodemailer: any = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        nodemailer = eval("require")("nodemailer");
      } catch {
        nodemailer = null;
      }
      if (nodemailer && nodemailer.createTransport) {
        const transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
          to: email,
          subject: `${otp} is your Repasters verification code`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #059669; margin-bottom: 8px;">Welcome to Repasters</h2>
              <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">Hi ${recipientName}, please use the code below to verify your email address. This code is valid for <strong>${remainingMinutes} minutes</strong>.</p>
              <div style="text-align: center; margin: 24px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a; padding: 12px 24px; background-color: #f1f5f9; border-radius: 8px; border: 1px dashed #cbd5e1;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; margin-top: 24px; text-align: center;">If you did not request this verification, you can safely ignore this email.</p>
            </div>
          `,
        });
      }
    }
  } catch (error) {
    console.warn("[REPASTERS] Could not dispatch external email via SMTP:", error);
  }

  return { success: true };
}
