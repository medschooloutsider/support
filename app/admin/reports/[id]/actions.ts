"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth";
import { buildPublicIssueSlug, canTransitionReport } from "@/lib/moderation";
import {
  publicIssueDraftSchema,
  reportReviewStatusSchema,
  type PublicIssueDraft,
  type PublicStatus,
  type ReportStatus,
} from "@/lib/schema";

type ReportRow = {
  id: string;
  status: ReportStatus;
  app_id: string;
  summary: string;
  app_version: string;
  platform: string;
  public_issue_id: string | null;
};

type PublicIssueRow = {
  id: string;
  slug: string;
  status: PublicStatus;
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

function readString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);

  return value.length ? value : undefined;
}

function redirectWithError(reportId: string | null, error: string): never {
  redirect(
    reportId
      ? `/admin/reports/${reportId}?error=${error}`
      : `/admin/reports?error=${error}`,
  );
}

async function getActorUserId(supabase: ReturnType<typeof createServiceClient>) {
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  return typeof userId === "string" ? userId : null;
}

async function loadReport(
  supabase: ReturnType<typeof createServiceClient>,
  reportId: string,
) {
  const { data } = await supabase
    .from("reports")
    .select(
      "id,status,app_id,summary,app_version,platform,public_issue_id",
    )
    .eq("id", reportId)
    .maybeSingle()
    .returns<ReportRow | null>();

  return data;
}

async function recordModerationEvent(
  supabase: ReturnType<typeof createServiceClient>,
  payload: {
    reportId: string;
    publicIssueId?: string | null;
    action: string;
    metadata: Record<string, unknown>;
  },
) {
  const actorUserId = await getActorUserId(supabase);

  await supabase.from("moderation_events").insert({
    report_id: payload.reportId,
    public_issue_id: payload.publicIssueId ?? null,
    actor_user_id: actorUserId,
    action: payload.action,
    metadata: payload.metadata,
  });
}

export async function setReportStatusAction(formData: FormData) {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  const reportId = readString(formData, "reportId");
  const nextStatusResult = reportReviewStatusSchema.safeParse(
    readString(formData, "nextStatus"),
  );

  if (!reportId || !nextStatusResult.success) {
    redirectWithError(reportId, "invalid_status");
  }

  const supabase = createServiceClient();
  const report = await loadReport(supabase, reportId);

  if (!report) {
    redirectWithError(reportId, "report_not_found");
  }

  if (!canTransitionReport(report.status, nextStatusResult.data)) {
    redirectWithError(reportId, "transition_not_allowed");
  }

  const { error } = await supabase
    .from("reports")
    .update({
      status: nextStatusResult.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) {
    redirectWithError(reportId, "status_update_failed");
  }

  await recordModerationEvent(supabase, {
    reportId,
    publicIssueId: report.public_issue_id,
    action: "report_status_updated",
    metadata: {
      from: report.status,
      to: nextStatusResult.data,
    },
  });

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${reportId}`);
  redirect(`/admin/reports/${reportId}?message=status_updated`);
}

async function loadPublicIssue(
  supabase: ReturnType<typeof createServiceClient>,
  publicIssueId: string,
) {
  const { data } = await supabase
    .from("public_issues")
    .select(
      "id,slug,status,title,summary,affected_versions,affected_platforms,workaround,resolution_notes",
    )
    .eq("id", publicIssueId)
    .maybeSingle();

  return data as
    | {
        id: string;
        slug: string;
        status: PublicStatus;
        title: string;
        summary: string;
        affected_versions: string;
        affected_platforms: string;
        workaround: string | null;
        resolution_notes: string | null;
      }
    | null;
}

function buildIssuePayload(
  report: ReportRow,
  draft: PublicIssueDraft,
  existingIssue: PublicIssueRow | null,
) {
  const title = draft.title;
  const summary = draft.summary;
  const status = draft.status;
  const affectedVersions = draft.affectedVersions ?? report.app_version;
  const affectedPlatforms = draft.affectedPlatforms ?? report.platform;

  return {
    title,
    summary,
    status,
    affected_versions: affectedVersions,
    affected_platforms: affectedPlatforms,
    workaround: draft.workaround ?? null,
    resolution_notes: draft.resolutionNotes ?? null,
    slug: existingIssue?.slug ?? buildPublicIssueSlug(title, report.id),
  };
}

export async function publishPublicIssueAction(formData: FormData) {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  const reportId = readString(formData, "reportId");

  if (!reportId) {
    redirectWithError(null, "invalid_issue");
  }

  const draftResult = publicIssueDraftSchema.safeParse({
    title: readString(formData, "title"),
    summary: readString(formData, "summary"),
    status: readString(formData, "status"),
    affectedVersions: readOptionalString(formData, "affectedVersions"),
    affectedPlatforms: readOptionalString(formData, "affectedPlatforms"),
    workaround: readOptionalString(formData, "workaround"),
    resolutionNotes: readOptionalString(formData, "resolutionNotes"),
  });

  if (!draftResult.success) {
    redirectWithError(reportId, "invalid_issue");
  }

  const supabase = createServiceClient();
  const report = await loadReport(supabase, reportId);

  if (!report) {
    redirectWithError(reportId, "report_not_found");
  }

  const canPublishOrUpdate =
    canTransitionReport(report.status, "published") ||
    (report.status === "published" && report.public_issue_id !== null);

  if (!canPublishOrUpdate) {
    redirectWithError(reportId, "publish_not_allowed");
  }

  const existingIssue = report.public_issue_id
    ? await loadPublicIssue(supabase, report.public_issue_id)
    : null;

  const issuePayload = buildIssuePayload(report, draftResult.data, existingIssue);

  if (existingIssue) {
    const { error } = await supabase
      .from("public_issues")
      .update({
        status: issuePayload.status,
        title: issuePayload.title,
        summary: issuePayload.summary,
        affected_versions: issuePayload.affected_versions,
        affected_platforms: issuePayload.affected_platforms,
        workaround: issuePayload.workaround,
        resolution_notes: issuePayload.resolution_notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingIssue.id);

    if (error) {
      redirectWithError(reportId, "issue_update_failed");
    }
  } else {
    const { data: publicIssue, error } = await supabase
      .from("public_issues")
      .insert({
        slug: issuePayload.slug,
        app_id: report.app_id,
        status: issuePayload.status,
        title: issuePayload.title,
        summary: issuePayload.summary,
        affected_versions: issuePayload.affected_versions,
        affected_platforms: issuePayload.affected_platforms,
        workaround: issuePayload.workaround,
        resolution_notes: issuePayload.resolution_notes,
      })
      .select("id,slug,status")
      .single<PublicIssueRow>();

    if (error || !publicIssue) {
      redirectWithError(reportId, "issue_create_failed");
    }

    const { error: reportUpdateError } = await supabase
      .from("reports")
      .update({
        status: "published",
        public_issue_id: publicIssue.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (reportUpdateError) {
      redirectWithError(reportId, "issue_link_failed");
    }

    await recordModerationEvent(supabase, {
      reportId,
      publicIssueId: publicIssue.id,
      action: "public_issue_published",
      metadata: {
        publicIssueStatus: publicIssue.status,
        publicIssueSlug: publicIssue.slug,
        reportStatus: report.status,
      },
    });

    revalidatePath("/issues");
    revalidatePath(`/issues/${publicIssue.slug}`);
    revalidatePath("/admin/reports");
    revalidatePath(`/admin/reports/${reportId}`);
    redirect(`/admin/reports/${reportId}?message=issue_published`);
  }

  const publicIssueId = existingIssue.id;

  const { error: reportUpdateError } = await supabase
    .from("reports")
    .update({
      status: "published",
      public_issue_id: publicIssueId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (reportUpdateError) {
    redirectWithError(reportId, "issue_link_failed");
  }

  await recordModerationEvent(supabase, {
    reportId,
    publicIssueId,
    action: "public_issue_updated",
    metadata: {
      publicIssueStatus: issuePayload.status,
      publicIssueSlug: existingIssue.slug,
      reportStatus: report.status,
    },
  });

  revalidatePath("/issues");
  revalidatePath(`/issues/${existingIssue.slug}`);
  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${reportId}`);
  redirect(`/admin/reports/${reportId}?message=issue_updated`);
}
