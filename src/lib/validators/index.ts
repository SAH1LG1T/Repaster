import { z } from "zod";

export const UserRoleEnum = z.enum(["GIVER", "SEEKER", "MODERATOR", "ADMIN"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const AccountStatusEnum = z.enum(["ACTIVE", "SUSPENDED", "DELETED"]);
export type AccountStatus = z.infer<typeof AccountStatusEnum>;

export const ListingStatusEnum = z.enum([
  "DRAFT",
  "PUBLISHED",
  "RESERVED",
  "DISTRIBUTED",
  "CLOSED",
  "EXPIRED",
  "UNDER_REVIEW",
  "REMOVED",
]);
export type ListingStatus = z.infer<typeof ListingStatusEnum>;

export const ContactMethodEnum = z.enum(["PHONE", "EMAIL", "WHATSAPP", "EXTERNAL_URL"]);
export type ContactMethod = z.infer<typeof ContactMethodEnum>;

export const FoodCategoryEnum = z.enum([
  "PREPARED_MEALS",
  "BAKERY_PASTRY",
  "PRODUCE_FRESH",
  "DAIRY_CHILLED",
  "PACKAGED_PANTRY",
  "BEVERAGES",
  "MIXED_OTHER",
]);
export type FoodCategory = z.infer<typeof FoodCategoryEnum>;

export const ReportStatusEnum = z.enum(["PENDING", "REVIEWED_ACTION_TAKEN", "REVIEWED_DISMISSED"]);
export type ReportStatus = z.infer<typeof ReportStatusEnum>;

export const ReportTargetTypeEnum = z.enum(["OFFERING", "REQUEST", "USER", "AD"]);
export type ReportTargetType = z.infer<typeof ReportTargetTypeEnum>;

// Validation for Offering Creation
export const createOfferingSchema = z
  .object({
    title: z.string().min(5, "Title must be at least 5 characters").max(120),
    description: z.string().min(10, "Description must be at least 10 characters").max(2000),
    category: FoodCategoryEnum,
    approximateServings: z.string().min(1, "Approximate servings is required").max(100),
    preparedAt: z.string().or(z.date()).optional().nullable(),
    consumeByAt: z.string().or(z.date()),
    collectionWindow: z.string().max(255).optional().nullable(),
    locality: z.string().min(2, "Locality / Area is required").max(150),
    collectionNotes: z.string().max(500).optional().nullable(),
    dietaryAllergenInfo: z.string().max(500).optional().nullable(),
    photoUrl: z.string().url().optional().nullable(),
    photoStorageKey: z.string().optional().nullable(),
    publishedContactMethod: ContactMethodEnum,
    publishedContactValue: z.string().min(3, "Contact value is required").max(255),
    contactPublicationConsent: z.boolean().refine((val) => val === true, {
      message: "You must consent to publishing these contact details on the listing",
    }),
    authorityAndAccuracyConfirmed: z.boolean().refine((val) => val === true, {
      message: "You must confirm you have authority to distribute this food and details are accurate",
    }),
  })
  .superRefine((data, ctx) => {
    const consumeBy = new Date(data.consumeByAt);
    const now = new Date();
    if (isNaN(consumeBy.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid Consume-By timestamp",
        path: ["consumeByAt"],
      });
      return;
    }
    if (consumeBy.getTime() <= now.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Consume-By time must be in the future (cannot be past or now)",
        path: ["consumeByAt"],
      });
    }
    const maxDurationHours = Number(process.env.MAX_OFFERING_DURATION_HOURS || 72);
    const maxDurationMs = maxDurationHours * 60 * 60 * 1000;
    if (consumeBy.getTime() > now.getTime() + maxDurationMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Consume-By time cannot exceed maximum allowed duration of ${maxDurationHours} hours`,
        path: ["consumeByAt"],
      });
    }
  });

export type CreateOfferingInput = z.infer<typeof createOfferingSchema>;

// Validation for Food Request Creation
export const createFoodRequestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  preferredCategory: FoodCategoryEnum.optional().nullable(),
  approximateQuantity: z.string().max(100).optional().nullable(),
  neededByAt: z.string().or(z.date()).optional().nullable(),
  locality: z.string().min(2, "Locality / Area is required").max(150),
  displayAuthorName: z.string().min(2, "Author / Display Name is required").max(120),
  publishedContactMethod: ContactMethodEnum,
  publishedContactValue: z.string().min(3, "Contact details required").max(255),
  contactPublicationConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to publishing these contact details on your request",
  }),
  expiresAtHours: z.coerce.number().min(1).max(168).default(48),
});

export type CreateFoodRequestInput = z.infer<typeof createFoodRequestSchema>;

// Validation for Abuse Report
export const createAbuseReportSchema = z.object({
  targetType: ReportTargetTypeEnum,
  targetId: z.string().min(1),
  reason: z.string().min(3, "Reason must be at least 3 characters").max(100),
  details: z.string().max(1000).optional().nullable(),
});

export type CreateAbuseReportInput = z.infer<typeof createAbuseReportSchema>;

// Validation for User Auth & Registration
export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  contactPersonName: z.string().min(2, "Full name is required").optional(),
});

export const registerUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["GIVER", "SEEKER"]),
  contactPersonName: z.string().min(2, "Full name is required"),
  organizationName: z.string().max(120).optional().nullable(),
  countryCode: z.string().max(10).optional().nullable(),
  privatePhone: z.string().max(30).optional().nullable(),
  otp: z.string().length(6, "Verification code must be 6 digits").optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms of service and community guidelines",
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy",
  }),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
