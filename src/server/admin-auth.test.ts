import { describe, expect, it } from "vitest";
import {
  createAdminToken,
  verifyAdminPassword,
  verifyAdminToken,
} from "./admin-auth";

describe("admin-auth", () => {
  it("accepts correct password from env default", () => {
    const prev = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = "test-pass-xyz";
    try {
      expect(verifyAdminPassword("test-pass-xyz")).toBe(true);
      expect(verifyAdminPassword("wrong")).toBe(false);
    } finally {
      if (prev === undefined) delete process.env.ADMIN_PASSWORD;
      else process.env.ADMIN_PASSWORD = prev;
    }
  });

  it("round-trips signed admin token", () => {
    const prev = process.env.ADMIN_SECRET;
    process.env.ADMIN_SECRET = "unit-test-secret";
    try {
      const token = createAdminToken(60_000);
      expect(verifyAdminToken(token)).toBe(true);
      expect(verifyAdminToken(token + "x")).toBe(false);
      expect(verifyAdminToken("not.a.token")).toBe(false);
      expect(verifyAdminToken(null)).toBe(false);
    } finally {
      if (prev === undefined) delete process.env.ADMIN_SECRET;
      else process.env.ADMIN_SECRET = prev;
    }
  });
});
