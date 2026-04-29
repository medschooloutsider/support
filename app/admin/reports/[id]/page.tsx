import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth";

type AdminReportPageProps = {
  params: Promise<{ id: string }>;
};

type ReportDetailRow = {
  id: string;
  app_id: string;
  app_name: string | null;
  app_version: string;
  app_build: string | null;
  status: string;
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
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
        {children}
      </p>
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
}: AdminReportPageProps) {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  const { id } = await params;
  const supabase = createServiceClient();
  const { data: report } = await supabase
    .from("reports")
    .select(
      "id,app_id,app_name,app_version,app_build,status,category,summary,reporter_email,platform,os_version,description,reproduction_steps,expected_result,actual_result,workflow_context,diagnostics",
    )
    .eq("id", id)
    .maybeSingle()
    .returns<ReportDetailRow | null>();

  if (!report) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <article className="mx-auto w-full max-w-3xl">
        <Link
          href="/admin/reports"
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
        >
          Back to reports
        </Link>
        <div className="mt-8">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            {report.app_name ?? report.app_id} / {report.status}
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
