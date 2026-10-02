import { describe, expect, it } from "vitest";
import { sessionCookieHeader, shouldUseSecureCookie } from "./session";

describe("shouldUseSecureCookie", () => {
  it("is false for Docker production NODE_ENV without HTTPS", () => {
    expect(
      shouldUseSecureCookie({
        NODE_ENV: "production",
        COOKIE_SECURE: undefined,
        APP_URL: undefined,
      } as NodeJS.ProcessEnv),
    ).toBe(false);
  });

  it("is true when COOKIE_SECURE=true", () => {
    expect(
      shouldUseSecureCookie({
        NODE_ENV: "development",
        COOKIE_SECURE: "true",
      } as NodeJS.ProcessEnv),
    ).toBe(true);
  });

  it("is true when APP_URL is https", () => {
    expect(
      shouldUseSecureCookie({
        NODE_ENV: "production",
        APP_URL: "https://suan.example.com",
      } as NodeJS.ProcessEnv),
    ).toBe(true);
  });

  it("is false when COOKIE_SECURE=false even with https app url override priority", () => {
    // explicit false wins
    expect(
      shouldUseSecureCookie({
        NODE_ENV: "production",
        COOKIE_SECURE: "false",
        APP_URL: "https://suan.example.com",
      } as NodeJS.ProcessEnv),
    ).toBe(false);
  });
});

describe("sessionCookieHeader", () => {
  it("omits Secure under default env (local / docker http)", () => {
    const prev = process.env.COOKIE_SECURE;
    const prevApp = process.env.APP_URL;
    const prevNodeEnv = process.env.NODE_ENV;
    const env = process.env as unknown as Record<string, string | undefined>;
    delete process.env.COOKIE_SECURE;
    delete process.env.APP_URL;
    env.NODE_ENV = "production";
    try {
      const h = sessionCookieHeader("11111111-1111-1111-1111-111111111111");
      expect(h).toContain("ai_fortune_sid=");
      expect(h.toLowerCase()).not.toContain("secure");
      expect(h).toContain("HttpOnly");
      expect(h).toContain("SameSite=Lax");
    } finally {
      if (prev === undefined) delete process.env.COOKIE_SECURE;
      else process.env.COOKIE_SECURE = prev;
      if (prevApp === undefined) delete process.env.APP_URL;
      else process.env.APP_URL = prevApp;
      if (prevNodeEnv === undefined) delete env.NODE_ENV;
      else env.NODE_ENV = prevNodeEnv;
    }
  });
});
