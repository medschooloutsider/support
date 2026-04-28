import { describe, expect, it } from "vitest";

import {
  APP_IDS,
  PUBLIC_STATUSES,
  REPORT_STATUSES,
  reportInputSchema,
} from "@/lib/schema";

describe("report schema", () => {
  it("exposes the shared domain constants", () => {
    expect(APP_IDS).toEqual(["gpt_md", "pdf_md", "alarmist"]);
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
