import { describe, it } from "node:test";
import assert from "node:assert";
import { hasRole, type SessionUser } from "../src/lib/auth.ts";

describe("RBAC and Server Permission Enforcement", () => {
  it("verifies Seeker role cannot possess Giver privileges", () => {
    const seeker: SessionUser = { id: "1", email: "seeker@test.com", name: "Seeker", role: "SEEKER" };
    assert.strictEqual(seeker.role, "SEEKER");

    // Only GIVER role can post offerings
    const canPostOffering = hasRole(seeker, ["GIVER"]);
    assert.strictEqual(canPostOffering, false);
  });

  it("verifies Giver role is authorized to publish surplus offerings", () => {
    const giver: SessionUser = { id: "2", email: "giver@test.com", name: "Giver", role: "GIVER" };
    assert.strictEqual(giver.role, "GIVER");

    const canPostOffering = hasRole(giver, ["GIVER"]);
    assert.strictEqual(canPostOffering, true);
  });

  it("verifies Admin role has moderation and administrative privileges", () => {
    const admin: SessionUser = { id: "3", email: "admin@test.com", name: "Admin", role: "ADMIN" };
    assert.strictEqual(admin.role, "ADMIN");

    const canModerate = hasRole(admin, ["ADMIN", "MODERATOR"]);
    assert.strictEqual(canModerate, true);
  });
});
