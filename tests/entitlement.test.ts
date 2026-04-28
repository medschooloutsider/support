import { afterEach, describe, expect, it, vi } from "vitest";

import {
  parseLemonEntitlementRequestBody,
  POST,
} from "@/app/api/entitlements/lemon/route";
import { decideEntitlement, validateLemonLicenseKey } from "@/lib/entitlement";

const originalFetch = globalThis.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = originalFetch;
});

describe("decideEntitlement", () => {
  it("verifies app-originated reports with a valid app origin", () => {
    expect(
      decideEntitlement({
        appId: "alarmist",
        source: "app",
        appOriginValid: true,
        lemonValid: false,
      }),
    ).toEqual({ allowed: true, kind: "app_origin", queue: "verified" });
  });

  it("rejects app-originated reports with an invalid app origin", () => {
    expect(
      decideEntitlement({
        appId: "alarmist",
        source: "app",
        appOriginValid: false,
        lemonValid: false,
      }),
    ).toEqual({ allowed: false, kind: "unverified", queue: "unverified" });
  });

  it("verifies Lemon-verified web reports for GPT-MD", () => {
    expect(
      decideEntitlement({
        appId: "gpt_md",
        source: "web",
        appOriginValid: false,
        lemonValid: true,
      }),
    ).toEqual({ allowed: true, kind: "lemon_license", queue: "verified" });
  });

  it("accepts unsupported or unverified web reports into the unverified queue", () => {
    expect(
      decideEntitlement({
        appId: "alarmist",
        source: "web",
        appOriginValid: false,
        lemonValid: false,
      }),
    ).toEqual({ allowed: true, kind: "unverified", queue: "unverified" });
  });
});

describe("validateLemonLicenseKey", () => {
  it("returns true for an active valid Lemon license", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({ valid: true, license_key: { status: "active" } }),
        { status: 200 },
      ),
    );
    globalThis.fetch = fetchMock;

    await expect(validateLemonLicenseKey("license-key", "owner@example.com"))
      .resolves.toBe(true);
  });

  it("returns false for an expired invalid Lemon license", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({ valid: false, license_key: { status: "expired" } }),
        { status: 200 },
      ),
    );
    globalThis.fetch = fetchMock;

    await expect(validateLemonLicenseKey("license-key", "owner@example.com"))
      .resolves.toBe(false);
  });

  it("returns false when Lemon validation fetch rejects", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("network unavailable"));
    globalThis.fetch = fetchMock;

    await expect(validateLemonLicenseKey("license-key", "owner@example.com"))
      .resolves.toBe(false);
  });

  it("returns false when Lemon returns malformed JSON", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("not-json", { status: 200 }));
    globalThis.fetch = fetchMock;

    await expect(validateLemonLicenseKey("license-key", "owner@example.com"))
      .resolves.toBe(false);
  });
});

describe("parseLemonEntitlementRequestBody", () => {
  it("rejects non-object request bodies", () => {
    expect(parseLemonEntitlementRequestBody(null)).toBeNull();
    expect(parseLemonEntitlementRequestBody([])).toBeNull();
    expect(parseLemonEntitlementRequestBody("invalid")).toBeNull();
  });

  it("extracts string license request fields", () => {
    expect(
      parseLemonEntitlementRequestBody({
        licenseKey: "license-key",
        reporterEmail: "owner@example.com",
      }),
    ).toEqual({
      licenseKey: "license-key",
      reporterEmail: "owner@example.com",
    });
  });
});

describe("POST /api/entitlements/lemon", () => {
  it("returns 400 for malformed JSON", async () => {
    const response = await POST(
      new Request("https://example.com/api/entitlements/lemon", {
        method: "POST",
        body: "{",
      }) as never,
    );

    await expect(response.json()).resolves.toEqual({ valid: false });
    expect(response.status).toBe(400);
  });

  it("returns 400 for non-object JSON bodies", async () => {
    const response = await POST(
      new Request("https://example.com/api/entitlements/lemon", {
        method: "POST",
        body: JSON.stringify([]),
      }) as never,
    );

    await expect(response.json()).resolves.toEqual({ valid: false });
    expect(response.status).toBe(400);
  });
});
