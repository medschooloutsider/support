import { afterEach, describe, expect, it, vi } from "vitest";

import {
  parseAppleEntitlementRequestBody,
  POST as postAppleEntitlement,
} from "@/app/api/entitlements/apple/route";
import {
  parseLemonEntitlementRequestBody,
  POST,
} from "@/app/api/entitlements/lemon/route";
import {
  decideEntitlement,
  validateAppleReceipt,
  validateLemonLicenseKey,
} from "@/lib/entitlement";

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

describe("validateAppleReceipt", () => {
  it("returns true for a production receipt that matches GPT-MD", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 0,
          receipt: { bundle_id: "io.gptmd.app" },
        }),
        { status: 200 },
      ),
    );
    globalThis.fetch = fetchMock;

    await expect(
      validateAppleReceipt({
        appId: "gpt_md",
        receiptData: "receipt-data",
      }),
    ).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://buy.itunes.apple.com/verifyReceipt",
    );
  });

  it("falls back to sandbox when production returns 21007", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 21007 }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 0,
            receipt: { bundle_id: "io.pdfmd.app" },
          }),
          { status: 200 },
        ),
      );
    globalThis.fetch = fetchMock;

    await expect(
      validateAppleReceipt({
        appId: "pdf_md",
        receiptData: "sandbox-receipt",
        sharedSecret: "secret",
      }),
    ).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://buy.itunes.apple.com/verifyReceipt",
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "https://sandbox.itunes.apple.com/verifyReceipt",
    );
  });

  it("returns false when the bundle id does not match the app", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 0,
          receipt: { bundle_id: "io.pdfmd.app" },
        }),
        { status: 200 },
      ),
    );
    globalThis.fetch = fetchMock;

    await expect(
      validateAppleReceipt({
        appId: "gpt_md",
        receiptData: "receipt-data",
      }),
    ).resolves.toBe(false);
  });

  it("returns false for unknown app ids and empty receipts before fetching", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;

    await expect(
      validateAppleReceipt({
        appId: "alarmist",
        receiptData: "receipt-data",
      }),
    ).resolves.toBe(false);

    await expect(
      validateAppleReceipt({
        appId: "gpt_md",
        receiptData: "",
      }),
    ).resolves.toBe(false);

    expect(fetchMock).not.toHaveBeenCalled();
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

describe("parseAppleEntitlementRequestBody", () => {
  it("rejects non-object request bodies", () => {
    expect(parseAppleEntitlementRequestBody(null)).toBeNull();
    expect(parseAppleEntitlementRequestBody([])).toBeNull();
    expect(parseAppleEntitlementRequestBody("invalid")).toBeNull();
  });

  it("extracts string receipt request fields", () => {
    expect(
      parseAppleEntitlementRequestBody({
        appId: "gpt_md",
        receiptData: "receipt-data",
      }),
    ).toEqual({
      appId: "gpt_md",
      receiptData: "receipt-data",
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

describe("POST /api/entitlements/apple", () => {
  it("returns 400 for malformed JSON", async () => {
    const response = await postAppleEntitlement(
      new Request("https://example.com/api/entitlements/apple", {
        method: "POST",
        body: "{",
      }) as never,
    );

    await expect(response.json()).resolves.toEqual({ valid: false });
    expect(response.status).toBe(400);
  });

  it("returns 400 for non-object JSON bodies", async () => {
    const response = await postAppleEntitlement(
      new Request("https://example.com/api/entitlements/apple", {
        method: "POST",
        body: JSON.stringify([]),
      }) as never,
    );

    await expect(response.json()).resolves.toEqual({ valid: false });
    expect(response.status).toBe(400);
  });
});
