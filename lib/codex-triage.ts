import type { ReportStatus } from "@/lib/schema";

export type CodexTriageReportRow = {
  id: string;
  app_id: string;
  app_name: string | null;
  app_version: string;
  app_build: string | null;
  status: ReportStatus;
  category: string | null;
  source: string;
  summary: string;
  reporter_email: string;
  platform: string;
  os_version: string;
  description: string;
  reproduction_steps: string;
  expected_result: string;
  actual_result: string;
  workflow_context: unknown | null;
  diagnostics: unknown | null;
  created_at: string;
  updated_at: string;
};

export const codexTriagePolicy = {
  ownerTriggered: true,
  draftOnly: true,
  codexMay: [
    "create triage suggestions",
    "propose clusters",
    "summarize private evidence for owner review",
    "draft sanitized public issue text",
  ],
  codexMustNot: [
    "close reports",
    "publish public issues",
    "change customer-visible state",
    "change report status without owner approval",
  ],
} as const;

export const codexTriageRequestedOutput = {
  perReport: [
    "suggested_category",
    "suggested_severity",
    "suggested_priority",
    "private_owner_summary",
    "confidence",
  ],
  crossReport: [
    "duplicate_or_related_clusters",
    "cluster_rationale",
    "recommended_owner_next_actions",
  ],
  publicDrafts: [
    "sanitized_title",
    "sanitized_summary",
    "affected_apps_versions_platforms",
    "workaround_if_any",
  ],
} as const;

export const codexTriagePrompt =
  "Review this owner-triggered support triage bundle. Produce draft-only suggestions, clusters, summaries, and sanitized public issue drafts. Do not change statuses, close reports, publish issues, or change customer-visible state.";

function truncateString(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n[truncated ${
    value.length - maxLength
  } chars]`;
}

export function maskEmail(value: string) {
  const [local, domain] = value.split("@");

  if (!local || !domain) {
    return "***";
  }

  return `${local.slice(0, 1)}***@${domain}`;
}

export function sanitizeReportForCodex(report: CodexTriageReportRow) {
  const { diagnostics, workflow_context: workflowContext, ...safeReport } = report;

  return {
    ...safeReport,
    reporter_email: maskEmail(report.reporter_email),
    description: truncateString(report.description, 4000),
    reproduction_steps: truncateString(report.reproduction_steps, 4000),
    expected_result: truncateString(report.expected_result, 1500),
    actual_result: truncateString(report.actual_result, 1500),
    workflow_context_json: workflowContext
      ? truncateString(JSON.stringify(workflowContext), 12000)
      : null,
    diagnostics_json: diagnostics
      ? truncateString(JSON.stringify(diagnostics), 20000)
      : null,
  };
}

export function buildCodexTriageInputPayload(reports: CodexTriageReportRow[]) {
  return {
    policy: codexTriagePolicy,
    requestedOutput: codexTriageRequestedOutput,
    reports: reports.map(sanitizeReportForCodex),
  };
}

export type CodexTriageInputPayload = ReturnType<
  typeof buildCodexTriageInputPayload
>;

export function buildCodexTriageBundle({
  draftId,
  payload,
}: {
  draftId: string;
  payload: ReturnType<typeof buildCodexTriageInputPayload>;
}) {
  return JSON.stringify(
    {
      prompt: codexTriagePrompt,
      draftId,
      ...payload,
    },
    null,
    2,
  );
}

export function buildCodexTriageTitle(reports: CodexTriageReportRow[]) {
  const appNames = Array.from(
    new Set(reports.map((report) => report.app_name ?? report.app_id)),
  );
  const appLabel =
    appNames.length === 1 ? appNames[0] : `${appNames.length} apps`;

  return `${appLabel} triage draft for ${reports.length} report${
    reports.length === 1 ? "" : "s"
  }`;
}
