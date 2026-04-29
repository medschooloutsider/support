import { afterEach, describe, expect, it } from "vitest";

import { POST } from "@/app/api/app-reports/route";
import {
  APP_IDS,
  PUBLIC_STATUSES,
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  reportInputSchema,
} from "@/lib/schema";
import { buildReportInsert } from "@/lib/reports";

const originalAppOriginSecret = process.env.APP_ORIGIN_HMAC_SECRET;

afterEach(() => {
  process.env.APP_ORIGIN_HMAC_SECRET = originalAppOriginSecret;
});

describe("report schema", () => {
  it("exposes the shared domain constants", () => {
    expect(APP_IDS).toEqual(["gpt_md", "pdf_md", "alarmist"]);
    expect(REPORT_CATEGORIES).toEqual([
      "bug",
      "bad_output",
      "missing_feature",
      "purchase_access",
      "safety",
      "other",
    ]);
    expect(PUBLIC_STATUSES).toEqual([
      "known",
      "being_resolved",
      "to_be_resolved",
    ]);
    expect(REPORT_STATUSES).toContain("needs_info");
    expect(REPORT_STATUSES).toContain("unverified");
    expect(PUBLIC_STATUSES).not.toContain("new");
  });

  it("validates a complete report input", () => {
    const result = reportInputSchema.safeParse({
      appId: "gpt_md",
      appVersion: "1.0.0",
      platform: "macOS",
      osVersion: "15.4",
      reporterEmail: "reporter@example.com",
      summary: "Export preview fails",
      description:
        "The export preview fails after choosing a valid Markdown file from the app.",
      reproductionSteps:
        "Open the app, choose a Markdown file, then start the export preview.",
      expectedResult: "The preview should render.",
      actualResult: "The preview stays blank.",
      source: "web",
    });

    expect(result.success).toBe(true);
  });

  it("requires diagnostics for app-originated reports", () => {
    const result = reportInputSchema.safeParse({
      appId: "gpt_md",
      appVersion: "1.0.0",
      appBuild: "42",
      platform: "macOS",
      osVersion: "15.4",
      reporterEmail: "reporter@example.com",
      category: "bug",
      summary: "Export preview fails",
      description:
        "The export preview fails after choosing a valid Markdown file from the app.",
      reproductionSteps:
        "Open the app, choose a Markdown file, then start the export preview.",
      expectedResult: "The preview should render.",
      actualResult: "The preview stays blank.",
      workflowContext: { surface: "export" },
      source: "app",
    });

    expect(result.success).toBe(false);
  });

  it("validates a complete app-origin diagnostic report", () => {
    const result = reportInputSchema.safeParse({
      appId: "gpt_md",
      appName: "GPT-MD",
      appVersion: "1.0.0",
      appBuild: "42",
      platform: "macOS",
      osVersion: "15.4",
      reporterEmail: "reporter@example.com",
      category: "bug",
      summary: "Export preview fails",
      description:
        "The export preview fails after choosing a valid Markdown file from the app.",
      reproductionSteps:
        "Open the app, choose a Markdown file, then start the export preview.",
      expectedResult: "The preview should render.",
      actualResult: "The preview stays blank.",
      workflowContext: { surface: "export", selectedFileType: "markdown" },
      diagnostics: {
        recentLog: "recent log tail",
        lastError: "Preview stayed blank.",
        stackTrace: ["frame 1", "frame 2"],
        metadata: { exportMode: "preview" },
      },
      source: "app",
    });

    expect(result.success).toBe(true);
  });

  it("rejects unexpected report status input", () => {
    const result = reportInputSchema.safeParse({
      appId: "gpt_md",
      appVersion: "1.0.0",
      platform: "macOS",
      osVersion: "15.4",
      reporterEmail: "reporter@example.com",
      summary: "Export preview fails",
      description:
        "The export preview fails after choosing a valid Markdown file from the app.",
      reproductionSteps:
        "Open the app, choose a Markdown file, then start the export preview.",
      expectedResult: "The preview should render.",
      actualResult: "The preview stays blank.",
      source: "web",
      status: "known",
    });

    expect(result.success).toBe(false);
  });
});

describe("buildReportInsert", () => {
  const input = {
    appId: "pdf_md",
    appName: "PDF-MD",
    appVersion: "1.2.3",
    appBuild: "456",
    platform: "macOS",
    osVersion: "15.4",
    reporterEmail: "reporter@example.com",
    category: "bug",
    summary: "Export preview fails",
    description:
      "The export preview fails after choosing a valid Markdown file from the app.",
    reproductionSteps:
      "Open the app, choose a Markdown file, then start the export preview.",
    expectedResult: "The preview should render.",
    actualResult: "The preview stays blank.",
    workflowContext: { surface: "export" },
    diagnostics: { recentLog: "recent log tail" },
    source: "app",
  } as const;

  it("maps verified app origin reports to new app-origin inserts", () => {
    expect(
      buildReportInsert({
        input,
        entitlementKind: "app_origin",
        queue: "verified",
        reporterUserId: null,
      }),
    ).toMatchObject({
      app_id: "pdf_md",
      app_name: "PDF-MD",
      app_build: "456",
      category: "bug",
      status: "new",
      entitlement_kind: "app_origin",
      workflow_context: { surface: "export" },
      diagnostics: { recentLog: "recent log tail" },
    });
  });

  it("maps unverified reports to the unverified queue", () => {
    expect(
      buildReportInsert({
        input: { ...input, source: "web" },
        entitlementKind: "unverified",
        queue: "unverified",
        reporterUserId: null,
      }),
    ).toMatchObject({
      app_id: "pdf_md",
      status: "unverified",
      entitlement_kind: "unverified",
    });
  });
});

describe("POST /api/app-reports", () => {
  const payload = {
    appId: "pdf_md",
    appName: "PDF-MD",
    appVersion: "1.2.3",
    appBuild: "456",
    platform: "macOS",
    osVersion: "15.4",
    reporterEmail: "reporter@example.com",
    category: "bug",
    summary: "Export preview fails",
    description:
      "The export preview fails after choosing a valid Markdown file from the app.",
    reproductionSteps:
      "Open the app, choose a Markdown file, then start the export preview.",
    expectedResult: "The preview should render.",
    actualResult: "The preview stays blank.",
    workflowContext: { surface: "export" },
    diagnostics: { recentLog: "recent log tail" },
  };

  it("returns a controlled error for invalid JSON", async () => {
    process.env.APP_ORIGIN_HMAC_SECRET = "test-secret";

    const response = await POST(
      new Request("https://example.com/api/app-reports", {
        method: "POST",
        headers: {
          "x-support-timestamp": "1777420800",
          "x-support-signature": "invalid",
        },
        body: "{",
      }) as never,
    );

    await expect(response.json()).resolves.toEqual({
      error: "Invalid JSON body.",
    });
    expect(response.status).toBe(400);
  });

  it("denies invalid app-origin signatures before saving", async () => {
    process.env.APP_ORIGIN_HMAC_SECRET = "test-secret";

    const response = await POST(
      new Request("https://example.com/api/app-reports", {
        method: "POST",
        headers: {
          "x-support-timestamp": "1777420800",
          "x-support-signature": "invalid",
        },
        body: JSON.stringify(payload),
      }) as never,
    );

    await expect(response.json()).resolves.toEqual({
      error: "Invalid app origin.",
    });
    expect(response.status).toBe(401);
  });
});
