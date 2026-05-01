import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  publishPublicIssueAction,
  setReportStatusAction,
} from "./actions";
import { requireOwner } from "@/lib/auth";
import { canTransitionReport } from "@/lib/moderation";
import type { PublicStatus, ReportStatus } from "@/lib/schema";

type AdminReportPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ReportDetailRow = {
  id: string;
  app_id: string;
  app_name: string | null;
  app_version: string;
  app_build: string | null;
  status: ReportStatus;
  category: string | null;
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
  public_issue_id: string | null;
  updated_at: string;
};

type PublicIssueRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: PublicStatus;
  affected_versions: string;
  affected_platforms: string;
  workaround: string | null;
  resolution_notes: string | null;
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

const NOTICE_MESSAGES: Record<string, string> = {
  status_updated: "Report status updated.",
  issue_published: "Public issue published.",
  issue_updated: "Public issue updated.",
  invalid_status: "Check the report status action and submit again.",
  report_not_found: "The selected report could not be found.",
  transition_not_allowed: "That report status change is not allowed.",
  status_update_failed: "The report status could not be updated.",
  invalid_issue: "Check the public issue fields and submit again.",
  publish_not_allowed: "This report cannot be published from its current status.",
  issue_create_failed: "The public issue could not be created.",
  issue_update_failed: "The public issue could not be updated.",
  issue_link_failed: "The report could not be linked to the public issue.",
};

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-zinc-200 py-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
        {children}
      </div>
    </section>
  );
}

function formatJsonDetail(value: unknown) {
  if (value === null || value === undefined) {
    return "Not supplied.";
  }

  return JSON.stringify(value, null, 2);
}

export default async function AdminReportPage({
  params,
  searchParams,
}: AdminReportPageProps) {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  const query = searchParams ? await searchParams : {};
  const { id } = await params;
  const supabase = createServiceClient();
  const { data: report } = await supabase
    .from("reports")
    .select(
      "id,app_id,app_name,app_version,app_build,status,category,summary,reporter_email,platform,os_version,description,reproduction_steps,expected_result,actual_result,workflow_context,diagnostics,public_issue_id,updated_at",
    )
    .eq("id", id)
    .maybeSingle()
    .returns<ReportDetailRow | null>();

  if (!report) {
    notFound();
  }

  const reportStatus = report.status as ReportStatus;
  const { data: linkedIssue } = report.public_issue_id
    ? await supabase
        .from("public_issues")
        .select(
          "id,slug,title,summary,status,affected_versions,affected_platforms,workaround,resolution_notes",
        )
        .eq("id", report.public_issue_id)
        .maybeSingle()
        .returns<PublicIssueRow | null>()
    : { data: null };

  const noticeKey =
    typeof query.message === "string"
      ? query.message
      : typeof query.error === "string"
        ? query.error
        : null;
  const noticeText = noticeKey ? NOTICE_MESSAGES[noticeKey] : null;
  const canPublish =
    canTransitionReport(reportStatus, "published") ||
    (reportStatus === "published" && report.public_issue_id !== null);
  const titleValue = linkedIssue?.title ?? report.summary;
  const summaryValue = linkedIssue?.summary ?? report.description;
  const statusValue = linkedIssue?.status ?? "known";
  const affectedVersionsValue =
    linkedIssue?.affected_versions ?? report.app_version;
  const affectedPlatformsValue =
    linkedIssue?.affected_platforms ?? report.platform;
  const workaroundValue = linkedIssue?.workaround ?? "";
  const resolutionNotesValue = linkedIssue?.resolution_notes ?? "";

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <article className="mx-auto w-full max-w-3xl">
        <Link
          href="/admin/reports"
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
        >
          Back to reports
        </Link>
        {noticeText ? (
          <p className="mt-6 rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
            {noticeText}
          </p>
        ) : null}
        <div className="mt-8">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            {report.app_name ?? report.app_id} / {reportStatus}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {report.summary}
          </h1>
          <p className="mt-4 text-sm text-zinc-600">
            Reporter: {report.reporter_email}
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Version: {report.app_version}
            {report.app_build ? ` (${report.app_build})` : ""} /{" "}
            {report.platform} {report.os_version}
            {report.category ? ` / ${report.category}` : ""}
          </p>
        </div>

        <div className="mt-10 rounded-md border border-zinc-200 bg-white px-6">
          <DetailSection title="Review actions">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-zinc-600">
                  Current state: {reportStatus}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {canTransitionReport(reportStatus, "new") ? (
                    <form action={setReportStatusAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="nextStatus" value="new" />
                      <button
                        type="submit"
                        className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-50"
                      >
                        Mark new
                      </button>
                    </form>
                  ) : null}
                  {canTransitionReport(reportStatus, "needs_info") ? (
                    <form action={setReportStatusAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="nextStatus" value="needs_info" />
                      <button
                        type="submit"
                        className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-50"
                      >
                        Needs info
                      </button>
                    </form>
                  ) : null}
                  {canTransitionReport(reportStatus, "closed") ? (
                    <form action={setReportStatusAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="nextStatus" value="closed" />
                      <button
                        type="submit"
                        className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-50"
                      >
                        Close report
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-950">
                      Public issue
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600">
                      Publish a summarized public issue and link it to this report.
                    </p>
                  </div>
                  {linkedIssue ? (
                    <Link
                      href={`/issues/${linkedIssue.slug}`}
                      className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
                    >
                      View public issue
                    </Link>
                  ) : null}
                </div>

                {linkedIssue ? (
                  <p className="mt-4 text-sm text-zinc-600">
                    Linked issue: {linkedIssue.title} / {linkedIssue.status}
                  </p>
                ) : null}

                {canPublish ? (
                  <form action={publishPublicIssueAction} className="mt-6 grid gap-4">
                    <input type="hidden" name="reportId" value={report.id} />
                    <div className="grid gap-2">
                      <label htmlFor="title" className="text-sm font-medium text-zinc-950">
                        Public title
                      </label>
                      <input
                        id="title"
                        name="title"
                        defaultValue={titleValue}
                        className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="summary" className="text-sm font-medium text-zinc-950">
                        Public summary
                      </label>
                      <textarea
                        id="summary"
                        name="summary"
                        rows={5}
                        defaultValue={summaryValue}
                        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label
                          htmlFor="status"
                          className="text-sm font-medium text-zinc-950"
                        >
                          Public status
                        </label>
                        <select
                          id="status"
                          name="status"
                          defaultValue={statusValue}
                          className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition-colors focus:border-zinc-950"
                        >
                          <option value="known">Known</option>
                          <option value="being_resolved">Being resolved</option>
                          <option value="to_be_resolved">To be resolved</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <label
                          htmlFor="affectedVersions"
                          className="text-sm font-medium text-zinc-950"
                        >
                          Affected versions
                        </label>
                        <input
                          id="affectedVersions"
                          name="affectedVersions"
                          defaultValue={affectedVersionsValue}
                          className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <label
                        htmlFor="affectedPlatforms"
                        className="text-sm font-medium text-zinc-950"
                      >
                        Affected platforms
                      </label>
                      <input
                        id="affectedPlatforms"
                        name="affectedPlatforms"
                        defaultValue={affectedPlatformsValue}
                        className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label
                        htmlFor="workaround"
                        className="text-sm font-medium text-zinc-950"
                      >
                        Workaround
                      </label>
                      <textarea
                        id="workaround"
                        name="workaround"
                        rows={3}
                        defaultValue={workaroundValue}
                        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label
                        htmlFor="resolutionNotes"
                        className="text-sm font-medium text-zinc-950"
                      >
                        Resolution notes
                      </label>
                      <textarea
                        id="resolutionNotes"
                        name="resolutionNotes"
                        rows={4}
                        defaultValue={resolutionNotesValue}
                        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                      >
                        {linkedIssue ? "Update public issue" : "Publish summarized issue"}
                      </button>
                    </div>
                  </form>
                ) : linkedIssue ? (
                  <p className="mt-6 text-sm text-zinc-600">
                    This report already has a linked public issue.
                  </p>
                ) : (
                  <p className="mt-6 text-sm text-zinc-600">
                    Mark the report as new or needs info before publishing a public issue.
                  </p>
                )}
              </div>
            </div>
          </DetailSection>
          <DetailSection title="Description">
            {report.description}
          </DetailSection>
          <DetailSection title="Reproduction steps">
            {report.reproduction_steps}
          </DetailSection>
          <DetailSection title="Expected result">
            {report.expected_result}
          </DetailSection>
          <DetailSection title="Actual result">
            {report.actual_result}
          </DetailSection>
          <DetailSection title="Workflow context">
            {formatJsonDetail(report.workflow_context)}
          </DetailSection>
          <DetailSection title="Private diagnostics">
            {formatJsonDetail(report.diagnostics)}
          </DetailSection>
        </div>
      </article>
    </main>
  );
}
