import { describe, expect, it } from "vitest";

import { buildPublicIssueSlug, canTransitionReport } from "@/lib/moderation";
import { publicIssueDraftSchema, reportReviewStatusSchema } from "@/lib/schema";

describe("canTransitionReport", () => {
  it("allows new reports to move to needs_info", () => {
    expect(canTransitionReport("new", "needs_info")).toBe(true);
  });

  it("allows needs_info reports to move back to new", () => {
    expect(canTransitionReport("needs_info", "new")).toBe(true);
  });

  it("allows new reports to move to published", () => {
    expect(canTransitionReport("new", "published")).toBe(true);
  });

  it("allows needs_info reports to move to closed", () => {
    expect(canTransitionReport("needs_info", "closed")).toBe(true);
  });

  it("rejects reopening closed reports as new", () => {
    expect(canTransitionReport("closed", "new")).toBe(false);
  });
});

describe("buildPublicIssueSlug", () => {
  it("derives a readable unique slug from the issue title", () => {
    expect(
      buildPublicIssueSlug("Export Preview Fails on PDF", "123e4567-e89b-12d3-a456-426614174000"),
    ).toBe("export-preview-fails-on-pdf-123e4567");
  });
});

describe("review schemas", () => {
  it("accepts only owner review statuses", () => {
    expect(reportReviewStatusSchema.safeParse("new").success).toBe(true);
    expect(reportReviewStatusSchema.safeParse("needs_info").success).toBe(true);
    expect(reportReviewStatusSchema.safeParse("closed").success).toBe(true);
    expect(reportReviewStatusSchema.safeParse("published").success).toBe(false);
  });

  it("validates a public issue draft payload", () => {
    const result = publicIssueDraftSchema.safeParse({
      title: "Export preview fails",
      summary:
        "The export preview stays blank after opening a Markdown file in the PDF export flow.",
      status: "known",
      affectedVersions: "1.2.3",
      affectedPlatforms: "macOS 15.4",
    });

    expect(result.success).toBe(true);
  });
});
