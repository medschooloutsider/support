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

export async function bulkSetReportStatusAction(formData: FormData) {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  const returnPath = readReturnPath(formData);
  const reportIds = formData
    .getAll("reportId")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
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
