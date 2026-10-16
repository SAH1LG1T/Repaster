export interface OfferingRecord {
  id: string;
  giverId: string;
  giverName: string;
  title: string;
  description: string;
  category: "PREPARED_MEALS" | "BAKERY_PASTRY" | "PRODUCE_FRESH" | "DAIRY_CHILLED" | "PACKAGED_PANTRY" | "BEVERAGES" | "MIXED_OTHER";
  approximateServings: string;
  preparedAt?: string;
  consumeByAt: string;
  collectionWindow?: string;
  locality: string;
  collectionNotes?: string;
  dietaryAllergenInfo?: string;
  photoUrl?: string;
  photoStorageKey?: string;
  publishedContactMethod: "PHONE" | "EMAIL" | "WHATSAPP" | "EXTERNAL_URL";
  publishedContactValue: string;
  contactPublicationConsent: boolean;
  authorityAndAccuracyConfirmed: boolean;
  status: "DRAFT" | "PUBLISHED" | "RESERVED" | "DISTRIBUTED" | "CLOSED" | "EXPIRED" | "UNDER_REVIEW" | "REMOVED";
  expiresAt: string;
  distributedAt?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface FoodRequestRecord {
  id: string;
  seekerId: string;
  title: string;
  description: string;
  preferredCategory?: "PREPARED_MEALS" | "BAKERY_PASTRY" | "PRODUCE_FRESH" | "DAIRY_CHILLED" | "PACKAGED_PANTRY" | "BEVERAGES" | "MIXED_OTHER";
  approximateQuantity?: string;
  neededByAt?: string;
  locality: string;
  displayAuthorName: string;
  publishedContactMethod: "PHONE" | "EMAIL" | "WHATSAPP" | "EXTERNAL_URL";
  publishedContactValue: string;
  contactPublicationConsent: boolean;
  status: "DRAFT" | "PUBLISHED" | "RESERVED" | "DISTRIBUTED" | "CLOSED" | "EXPIRED" | "UNDER_REVIEW" | "REMOVED";
  expiresAt: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AbuseReportRecord {
  id: string;
  reporterId?: string | null;
  targetType: "OFFERING" | "REQUEST" | "USER" | "AD";
  targetId: string;
  reason: string;
  details?: string | null;
  status: "PENDING" | "REVIEWED_ACTION_TAKEN" | "REVIEWED_DISMISSED";
  moderatorNotes?: string | null;
  resolvedById?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Active real-time arrays (populated exclusively via backend API and Neon DB)
export const mockOfferings: OfferingRecord[] = [];

export const mockRequests: FoodRequestRecord[] = [];

export const mockReports: AbuseReportRecord[] = [];

export const mockAuditLogs: AuditLogRecord[] = [];
