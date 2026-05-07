import { describe, expect, it } from "vitest";

import {
  buildCodexTriageBundle,
  buildCodexTriageInputPayload,
  maskEmail,
  sanitizeReportForCodex,
  type CodexTriageReportRow,
} from "@/lib/codex-triage";

const report: CodexTriageReportRow = {
  id: "report-1",
  app_id: "pdf_md",
  app_name: "PDF-MD",
  app_version: "1.0",
  app_build: "7",
  status: "unverified",
  category: "bug",
  source: "app",
  summary: "Preview fails",
  reporter_email: "reporter@example.com",
  platform: "macOS",
  os_version: "15.5",
  description: "The preview fails after loading a difficult PDF.",
  reproduction_steps: "Open the app and load the fixture.",
  expected_result: "Markdown appears.",
  actual_result: "The preview remains blank.",
  workflow_context: { surface: "preview", file: "fixture.pdf" },
  diagnostics: { recentLog: "log tail", stackTrace: ["private frame"] },
  created_at: "2026-05-07T00:00:00.000Z",
  updated_at: "2026-05-07T00:00:00.000Z",
};

describe("Codex triage helpers", () => {
  it("masks reporter emails", () => {
    expect(maskEmail("reporter@example.com")).toBe("r***@example.com");
    expect(maskEmail("invalid")).toBe("***");
  });

  it("keeps raw diagnostics out of the sanitized report", () => {
    const sanitized = sanitizeReportForCodex(report);

    expect(sanitized.reporter_email).toBe("r***@example.com");
    expect("diagnostics" in sanitized).toBe(false);
    expect("workflow_context" in sanitized).toBe(false);
    expect(sanitized.diagnostics_json).toContain("recentLog");
    expect(sanitized.workflow_context_json).toContain("preview");
  });

  it("builds a draft-only bundle with explicit owner approval boundaries", () => {
    const payload = buildCodexTriageInputPayload([report]);
    const bundle = JSON.parse(
      buildCodexTriageBundle({ draftId: "draft-1", payload }),
    ) as {
      draftId: string;
      policy: { draftOnly: boolean; codexMustNot: string[] };
      reports: Array<{ reporter_email: string }>;
    };

    expect(bundle.draftId).toBe("draft-1");
    expect(bundle.policy.draftOnly).toBe(true);
    expect(bundle.policy.codexMustNot).toContain("publish public issues");
    expect(bundle.policy.codexMustNot).toContain("change customer-visible state");
    expect(bundle.reports[0].reporter_email).toBe("r***@example.com");
  });
});
