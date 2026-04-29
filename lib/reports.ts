import type { EntitlementDecision } from "@/lib/entitlement";
import type { ReportInput, ReportStatus } from "@/lib/schema";

type BuildReportInsertInput = {
  input: ReportInput;
  entitlementKind: EntitlementDecision["kind"];
  queue: EntitlementDecision["queue"];
  reporterUserId: string | null;
};

export type ReportInsert = {
  app_id: ReportInput["appId"];
  app_version: string;
  platform: string;
  os_version: string;
  reporter_email: string;
  reporter_user_id: string | null;
  source: ReportInput["source"];
  status: ReportStatus;
  entitlement_kind: EntitlementDecision["kind"];
  summary: string;
  description: string;
  reproduction_steps: string;
  expected_result: string;
  actual_result: string;
};

export function buildReportInsert({
  input,
  entitlementKind,
  queue,
  reporterUserId,
}: BuildReportInsertInput): ReportInsert {
  return {
    app_id: input.appId,
    app_version: input.appVersion,
    platform: input.platform,
    os_version: input.osVersion,
    reporter_email: input.reporterEmail,
    reporter_user_id: reporterUserId,
    source: input.source,
    status: queue === "verified" ? "new" : "unverified",
    entitlement_kind: entitlementKind,
    summary: input.summary,
    description: input.description,
    reproduction_steps: input.reproductionSteps,
    expected_result: input.expectedResult,
    actual_result: input.actualResult,
  };
}
