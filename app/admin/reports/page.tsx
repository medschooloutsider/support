import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminReportBatchTable } from "@/components/admin-report-batch-table";
import { requireOwner } from "@/lib/auth";
import {
  APP_IDS,
  REPORT_SOURCES,
  REPORT_STATUSES,
  type AppId,
  type ReportSource,
  type ReportStatus,
} from "@/lib/schema";

type AdminReportsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ReportQueueRow = {
  id: string;
  app_id: string;
  app_name: string | null;
  app_version: string;
  app_build: string | null;
  category: string | null;
  source: string;
  status: string;
  summary: string;
  reporter_email: string;
  platform: string;
  created_at: string;
  updated_at: string;
};

type ReportCountRow = {
  app_id: AppId;
  source: ReportSource;
  status: ReportStatus;
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  new: "New",
  needs_info: "Needs info",
  merged: "Merged",
  published: "Published",
  closed: "Closed",
  unverified: "Unverified",
};

const APP_LABELS: Record<AppId, string> = {
  gpt_md: "GPT-MD",
  pdf_md: "PDF-MD",
  alarmist: "Alarmist",
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

function getSingleParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];

  return Array.isArray(value) ? value[0] : value;
}

function isAppId(value: string | undefined): value is AppId {
  return APP_IDS.includes(value as AppId);
}

function isReportStatus(value: string | undefined): value is ReportStatus {
  return REPORT_STATUSES.includes(value as ReportStatus);
}

function isReportSource(value: string | undefined): value is ReportSource {
  return REPORT_SOURCES.includes(value as ReportSource);
}

function countBy<T extends string>(rows: ReportCountRow[], key: keyof ReportCountRow) {
  return rows.reduce<Record<T, number>>((counts, row) => {
    const value = row[key] as T;
    counts[value] = (counts[value] ?? 0) + 1;

    return counts;
  }, {} as Record<T, number>);
}

function buildReturnPath(params: URLSearchParams) {
  const query = params.toString();

  return query ? `/admin/reports?${query}` : "/admin/reports";
}

export default async function AdminReportsPage({
  searchParams,
}: AdminReportsPageProps) {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  const query = searchParams ? await searchParams : {};
  const appFilter = getSingleParam(query, "app");
  const statusFilter = getSingleParam(query, "status");
  const sourceFilter = getSingleParam(query, "source");
  const search = getSingleParam(query, "q")?.trim() ?? "";
  const message = getSingleParam(query, "message");
  const error = getSingleParam(query, "error");
  const updated = getSingleParam(query, "updated");
  const skipped = getSingleParam(query, "skipped");
  const params = new URLSearchParams();

  if (isAppId(appFilter)) params.set("app", appFilter);
  if (isReportStatus(statusFilter)) params.set("status", statusFilter);
  if (isReportSource(sourceFilter)) params.set("source", sourceFilter);
  if (search) params.set("q", search);

  const supabase = createServiceClient();
  const [{ data: allReports }, reportResult] = await Promise.all([
    supabase
      .from("reports")
      .select("app_id,source,status")
      .returns<ReportCountRow[]>(),
    supabase
      .from("reports")
      .select(
        "id,app_id,app_name,app_version,app_build,category,source,status,summary,reporter_email,platform,created_at,updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(500)
      .returns<ReportQueueRow[]>(),
  ]);

  const filteredReports = (reportResult.data ?? []).filter((report) => {
    if (isAppId(appFilter) && report.app_id !== appFilter) return false;
    if (isReportStatus(statusFilter) && report.status !== statusFilter) return false;
    if (isReportSource(sourceFilter) && report.source !== sourceFilter) return false;
    if (!search) return true;

    const haystack = [
      report.id,
      report.summary,
      report.reporter_email,
      report.app_name,
      report.category,
      report.platform,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(search.toLowerCase());
  });

  const totalReports = allReports?.length ?? 0;
  const statusCounts = countBy<ReportStatus>(allReports ?? [], "status");
  const appCounts = countBy<AppId>(allReports ?? [], "app_id");
  const notice =
    message === "bulk_status_updated"
      ? `Updated ${updated ?? 0} report${updated === "1" ? "" : "s"}${
          skipped && skipped !== "0" ? `; skipped ${skipped}` : ""
        }.`
      : error
        ? "Batch action could not be completed for the selected reports."
        : null;

  return (
    <main className="support-shell-wide">
      <section className="support-panel">
        <div className="support-panel-header">
          <Link
            href="/admin"
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            Back to admin
          </Link>
          <p className="kicker mt-8">Owner queue</p>
          <h1 className="hero-title">Report command center.</h1>
          <p className="subtitle">
            Scan, filter, and batch-manage private app reports without losing the
            underlying diagnostics.
          </p>
        </div>

        <div className="grid gap-4 border-b border-[var(--rule)] bg-white p-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="support-card support-card-soft">
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
              Total
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
              {totalReports}
            </p>
          </div>
          {REPORT_STATUSES.map((status) => (
            <div key={status} className="support-card">
              <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {STATUS_LABELS[status]}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                {statusCounts[status] ?? 0}
              </p>
            </div>
          ))}
        </div>

        <div className="border-b border-[var(--rule)] bg-[var(--steel)] p-4">
          <form className="grid gap-3 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_auto]">
            <input
              name="q"
              defaultValue={search}
              placeholder="Search summary, reporter, id, category"
              className="h-11 rounded-md border border-[var(--rule-dark)] bg-white px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--green)]"
            />
            <select
              name="app"
              defaultValue={isAppId(appFilter) ? appFilter : ""}
              className="h-11 rounded-md border border-[var(--rule-dark)] bg-white px-3 text-sm text-[var(--ink)]"
            >
              <option value="">All apps</option>
              {APP_IDS.map((app) => (
                <option key={app} value={app}>
                  {APP_LABELS[app]} ({appCounts[app] ?? 0})
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={isReportStatus(statusFilter) ? statusFilter : ""}
              className="h-11 rounded-md border border-[var(--rule-dark)] bg-white px-3 text-sm text-[var(--ink)]"
            >
              <option value="">All statuses</option>
              {REPORT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <select
              name="source"
              defaultValue={isReportSource(sourceFilter) ? sourceFilter : ""}
              className="h-11 rounded-md border border-[var(--rule-dark)] bg-white px-3 text-sm text-[var(--ink)]"
            >
              <option value="">All sources</option>
              <option value="app">App</option>
              <option value="web">Web</option>
            </select>
            <button type="submit" className="button-primary">
              Filter
            </button>
          </form>
          {notice ? (
            <p className="mt-3 rounded-md border border-[var(--rule)] bg-white px-3 py-2 text-sm text-[var(--muted)]">
              {notice}
            </p>
          ) : null}
        </div>

        <div className="p-4">
          <AdminReportBatchTable
            reports={filteredReports}
            returnPath={buildReturnPath(params)}
          />
        </div>
      </section>
    </main>
  );
}
