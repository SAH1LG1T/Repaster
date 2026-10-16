import { z } from "zod";

const envSchema = z.object({
  // App & Base URLs
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:3000/api/v1"),

  // Database (PostgreSQL)
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/repasters?sslmode=require"),
  DIRECT_DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/repasters"),

  // Authentication & Security
  AUTH_SECRET: z.string().min(16).default("f63c8a91b29d47a0b5c1e9a4f6d8c0b2f63c8a91b29d47a0b5c1e9a4f6d8c0b2"),
  SESSION_MAX_AGE_SECONDS: z.coerce.number().default(604800),
  ARGON2_MEMORY_COST: z.coerce.number().default(65536),

  // Object Storage
  S3_ENDPOINT: z.string().min(1).default("https://s3.us-east-1.amazonaws.com"),
  S3_REGION: z.string().min(1).default("auto"),
  S3_BUCKET_NAME: z.string().min(1).default("local-food-connect-uploads"),
  S3_ACCESS_KEY_ID: z.string().default("dummy-access-key-id"),
  S3_SECRET_ACCESS_KEY: z.string().default("dummy-secret-access-key"),
  NEXT_PUBLIC_CDN_BASE_URL: z.string().url().default("https://images.unsplash.com"),

  // Transactional Email (Brevo & SMTP)
  BREVO_API_KEY: z.string().default(""),
  EMAIL_FROM_NAME: z.string().default("Repaster"),
  EMAIL_FROM_ADDRESS: z.string().email().default("reposter.service@gmail.com"),
  SMTP_HOST: z.string().default("smtp.example.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default("apikey"),
  SMTP_PASSWORD: z.string().default("dummy-smtp-password"),

  // Rate Limiting & Pagination
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(30),
  RATE_LIMIT_AUTH_MAX_REQUESTS: z.coerce.number().default(5),
  DEFAULT_PAGE_SIZE: z.coerce.number().default(12),
  MAX_PAGE_SIZE: z.coerce.number().default(50),
  MAX_IMAGE_UPLOAD_BYTES: z.coerce.number().default(5242880),

  // Food Expiry & Soft-Delete 3-Month Retention (90 days = 2160 hours for traceability)
  CRON_SECRET: z.string().min(8).default("f63c8a91b29d47a0b5c1e9a4f6d8c0b2"),
  MAX_OFFERING_DURATION_HOURS: z.coerce.number().default(72),
  EXPIRED_RETENTION_HOURS: z.coerce.number().default(2160), // 3 months
  DISTRIBUTED_RETENTION_HOURS: z.coerce.number().default(2160), // 3 months

  // Advertising
  NEXT_PUBLIC_ENABLE_ADS: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default(true),
  NEXT_PUBLIC_AD_PROVIDER_SCRIPT_URL: z.string().default(""),
  NEXT_PUBLIC_AD_SLOT_DESKTOP_RAIL_ID: z.string().default("slot-desktop-rail"),
  NEXT_PUBLIC_AD_SLOT_MOBILE_FEED_ID: z.string().default("slot-mobile-feed"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.format());
    return envSchema.parse({
      ...process.env,
      NEXT_PUBLIC_ENABLE_ADS: "true",
    });
  }
  return result.data;
}

export const env = parseEnv();
