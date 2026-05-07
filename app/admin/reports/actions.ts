"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth";
import { canTransitionReport } from "@/lib/moderation";
import { reportReviewStatusSchema, type ReportStatus } from "@/lib/schema";

type BatchReportRow = {
  id: string;
  status: ReportStatus;
  public_issue_id: string | null;
};

type CodexTriageReportRow = {
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

export type CodexTriageState = {
  message: string;
  draftId?: string;
  bundle?: string;
};

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: { persistSession: false },
    },
  );
}

function readReturnPath(formData: FormData) {
  const value = formData.get("returnPath");

  return typeof value === "string" && value.startsWith("/admin/reports")
    ? value
    : "/admin/reports";
}

async function getActorUserId(supabase: ReturnType<typeof createServiceClient>) {
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  return typeof userId === "string" ? userId : null;
}

function readReportIds(formData: FormData) {
  return formData
    .getAll("reportId")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

function truncateString(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n[truncated ${value.length - maxLength} chars]`;
}

function sanitizeForBundle(report: CodexTriageReportRow) {
  return {
    ...report,
    reporter_email: report.reporter_email.replace(/^(.).+(@.*)$/, "$1***$2"),
    description: truncateString(report.description, 4000),
    reproduction_steps: truncateString(report.reproduction_steps, 4000),
    expected_result: truncateString(report.expected_result, 1500),
    actual_result: truncateString(report.actual_result, 1500),
    diagnostics_json: report.diagnostics
      ? truncateString(JSON.stringify(report.diagnostics), 20000)
      : null,
  };
}

export async function prepareCodexTriageAction(
  _previousState: CodexTriageState,
  formData: FormData,
): Promise<CodexTriageState> {
  const owner = await requireOwner();

  if (!owner.allowed) {
    return { message: "Owner session is required." };
  }

  const reportIds = readReportIds(formData);

  if (!reportIds.length) {
    return { message: "Select at least one report before preparing Codex triage." };
  }

  if (reportIds.length > 25) {
    return { message: "Select 25 or fewer reports for one Codex triage bundle." };
  }

  const supabase = createServiceClient();
  const { data: reports, error } = await supabase
    .from("reports")
    .select(
      "id,app_id,app_name,app_version,app_build,status,category,source,summary,reporter_email,platform,os_version,description,reproduction_steps,expected_result,actual_result,workflow_context,diagnostics,created_at,updated_at",
    )
    .in("id", reportIds)
    .returns<CodexTriageReportRow[]>();

  if (error || !reports?.length) {
    return { message: "Could not load selected reports for Codex triage." };
  }

  const payload = {
    policy: {
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
    },
    requestedOutput: {
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
    },
    reports: reports.map(sanitizeForBundle),
  };
  const actorUserId = await getActorUserId(supabase);
  const { data: draft, error: insertError } = await supabase
    .from("moderation_events")
    .insert({
      report_id: null,
      public_issue_id: null,
      actor_user_id: actorUserId,
      action: "codex_triage_draft_prepared",
      metadata: {
        draftOnly: true,
        reportIds: reports.map((report) => report.id),
        payload,
      },
    })
    .select("id")
    .single<{ id: string }>();

  if (insertError || !draft) {
    return { message: "Could not save the Codex triage draft audit event." };
  }

  const bundle = JSON.stringify(
    {
      prompt:
        "Review this owner-triggered support triage bundle. Produce draft-only suggestions, clusters, summaries, and sanitized public issue drafts. Do not change statuses, close reports, publish issues, or change customer-visible state.",
      draftId: draft.id,
      ...payload,
    },
    null,
    2,
  );

  return {
    message: `Prepared Codex triage draft ${draft.id} for ${reports.length} report${
      reports.length === 1 ? "" : "s"
    }.`,
    draftId: draft.id,
    bundle,
  };
}

export async function bulkSetReportStatusAction(formData: FormData) {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  const returnPath = readReturnPath(formData);
  const reportIds = readReportIds(formData);
  const nextStatusResult = reportReviewStatusSchema.safeParse(
    formData.get("nextStatus"),
  );

  if (!reportIds.length || !nextStatusResult.success) {
    redirect(`${returnPath}?error=bulk_invalid`);
  }

  const supabase = createServiceClient();
  const { data: reports, error: loadError } = await supabase
    .from("reports")
    .select("id,status,public_issue_id")
    .in("id", reportIds)
    .returns<BatchReportRow[]>();

  if (loadError || !reports?.length) {
    redirect(`${returnPath}?error=bulk_load_failed`);
  }

  const nextStatus = nextStatusResult.data;
  const validReports = reports.filter((report) =>
    canTransitionReport(report.status, nextStatus),
  );
  const skipped = reportIds.length - validReports.length;

  if (!validReports.length) {
    redirect(`${returnPath}?error=bulk_no_valid_transitions&skipped=${skipped}`);
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("reports")
    .update({
      status: nextStatus,
      updated_at: now,
    })
    .in(
      "id",
      validReports.map((report) => report.id),
    );

  if (updateError) {
    redirect(`${returnPath}?error=bulk_update_failed`);
  }

  const actorUserId = await getActorUserId(supabase);
  await supabase.from("moderation_events").insert(
    validReports.map((report) => ({
      report_id: report.id,
      public_issue_id: report.public_issue_id,
      actor_user_id: actorUserId,
      action: "bulk_report_status_updated",
      metadata: {
        from: report.status,
        to: nextStatus,
      },
    })),
  );

  revalidatePath("/admin/reports");
  validReports.forEach((report) => {
    revalidatePath(`/admin/reports/${report.id}`);
  });

  redirect(
    `${returnPath}?message=bulk_status_updated&updated=${validReports.length}&skipped=${skipped}`,
  );
}
