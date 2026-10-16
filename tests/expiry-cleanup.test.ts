import { describe, it } from "node:test";
import assert from "node:assert";
import { createOfferingSchema } from "../src/lib/validators/index.ts";

describe("Food Expiry, Validation & 3-Layer Cleanup Rules", () => {
  it("rejects an offering with a past consumeByAt timestamp", () => {
    const pastTime = new Date(Date.now() - 3600 * 1000).toISOString();
    const result = createOfferingSchema.safeParse({
      title: "Fresh Croissants and Muffins",
      description: "Baked fresh this morning, excess bakery stock.",
      category: "BAKERY_PASTRY",
      approximateServings: "30 items",
      consumeByAt: pastTime,
      locality: "Downtown",
      publishedContactMethod: "PHONE",
      publishedContactValue: "+1 555-0100",
      contactPublicationConsent: true,
      authorityAndAccuracyConfirmed: true,
    });

    assert.strictEqual(result.success, false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("consumeByAt"));
      assert.ok(issue, "Expected consumeByAt error");
    }
  });

  it("rejects an offering exceeding MAX_OFFERING_DURATION_HOURS (72 hours)", () => {
    const excessiveTime = new Date(Date.now() + 100 * 3600 * 1000).toISOString();
    const result = createOfferingSchema.safeParse({
      title: "Fresh Bread Batch",
      description: "Extra baguettes from afternoon bake.",
      category: "BAKERY_PASTRY",
      approximateServings: "20 baguettes",
      consumeByAt: excessiveTime,
      locality: "West End",
      publishedContactMethod: "PHONE",
      publishedContactValue: "+1 555-0100",
      contactPublicationConsent: true,
      authorityAndAccuracyConfirmed: true,
    });

    assert.strictEqual(result.success, false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("consumeByAt"));
      assert.ok(issue, "Expected consumeByAt duration error");
    }
  });

  it("accepts a valid offering within the 72-hour consume-by window with required consent", () => {
    const validFuture = new Date(Date.now() + 12 * 3600 * 1000).toISOString();
    const result = createOfferingSchema.safeParse({
      title: "20 Packaged Gourmet Deli Salads",
      description: "Organic quinoa salads, kept chilled at 38F.",
      category: "PREPARED_MEALS",
      approximateServings: "20 containers",
      consumeByAt: validFuture,
      locality: "Financial District",
      publishedContactMethod: "WHATSAPP",
      publishedContactValue: "+1 555-0199",
      contactPublicationConsent: true,
      authorityAndAccuracyConfirmed: true,
    });

    assert.strictEqual(result.success, true);
  });
});
