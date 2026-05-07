"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth";
import {
  buildCodexTriageBundle,
  buildCodexTriageInputPayload,
  buildCodexTriageTitle,
  codexTriagePolicy,
  codexTriagePrompt,
  codexTriageRequestedOutput,
  type CodexTriageReportRow,
} from "@/lib/codex-triage";
import { canTransitionReport } from "@/lib/moderation";
import { reportReviewStatusSchema, type ReportStatus } from "@/lib/schema";

type BatchReportRow = {
  id: string;
  status: ReportStatus;
  public_issue_id: string | null;
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

export async function prepareCodexTriageAction(formData: FormData) {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  const returnPath = readReturnPath(formData);
  const reportIds = readReportIds(formData);

  if (!reportIds.length) {
    redirect(`${returnPath}?error=codex_no_selection`);
  }

  if (reportIds.length > 25) {
    redirect(`${returnPath}?error=codex_too_many`);
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
    redirect(`${returnPath}?error=codex_load_failed`);
  }

  const payload = buildCodexTriageInputPayload(reports);
  const actorUserId = owner.userId ?? (await getActorUserId(supabase));
  const title = buildCodexTriageTitle(reports);
  const { data: draft, error: insertError } = await supabase
    .from("codex_triage_drafts")
    .insert({
      actor_user_id: actorUserId,
      status: "prepared",
      title,
      prompt: codexTriagePrompt,
      policy: codexTriagePolicy,
      requested_output: codexTriageRequestedOutput,
      input_payload: payload,
      report_ids: reports.map((report) => report.id),
    })
    .select("id")
    .single<{ id: string }>();

  if (insertError || !draft) {
    const { data: fallbackDraft, error: fallbackError } = await supabase
      .from("moderation_events")
      .insert({
        report_id: null,
        public_issue_id: null,
        actor_user_id: actorUserId,
        action: "codex_triage_draft_prepared",
        metadata: {
          fallbackStore: "moderation_events",
          draftOnly: true,
          title,
          prompt: codexTriagePrompt,
          policy: codexTriagePolicy,
          requestedOutput: codexTriageRequestedOutput,
          reportIds: reports.map((report) => report.id),
          payload,
        },
      })
      .select("id")
      .single<{ id: string }>();

    if (fallbackError || !fallbackDraft) {
      redirect(`${returnPath}?error=codex_save_failed`);
    }

    revalidatePath("/admin/codex-triage");
    revalidatePath("/admin/reports");
    redirect(`/admin/codex-triage/${fallbackDraft.id}?message=prepared`);
  }

  await supabase.from("moderation_events").insert({
    report_id: null,
    public_issue_id: null,
    actor_user_id: actorUserId,
    action: "codex_triage_draft_prepared",
    metadata: {
      draftOnly: true,
      draftId: draft.id,
      reportIds: reports.map((report) => report.id),
      bundle: buildCodexTriageBundle({ draftId: draft.id, payload }),
    },
  });

  revalidatePath("/admin/codex-triage");
  revalidatePath("/admin/reports");
  redirect(`/admin/codex-triage/${draft.id}?message=prepared`);
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

  const actorUserId = owner.userId ?? (await getActorUserId(supabase));
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
