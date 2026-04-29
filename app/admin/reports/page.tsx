import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth";

type ReportQueueRow = {
  id: string;
  app_id: string;
  status: string;
  summary: string;
  reporter_email: string;
  created_at: string;
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

export default async function AdminReportsPage() {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  const supabase = createServiceClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("id,app_id,status,summary,reporter_email,created_at")
    .order("created_at", { ascending: false })
    .returns<ReportQueueRow[]>();

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-4xl">
        <Link
          href="/admin"
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
        >
          Back to admin
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">
          Report queue
        </h1>
        <div className="mt-8 divide-y divide-zinc-200 rounded-md border border-zinc-200 bg-white">
          {reports?.length ? (
            reports.map((report) => (
              <Link
                key={report.id}
                href={`/admin/reports/${report.id}`}
                className="block p-5 transition-colors hover:bg-zinc-50"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {report.app_id} / {report.status}
                    </p>
                    <h2 className="mt-2 text-base font-semibold text-zinc-950">
                      {report.summary}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600">
                      {report.reporter_email}
                    </p>
                  </div>
                  <time className="text-sm text-zinc-500">
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(report.created_at))}
                  </time>
                </div>
              </Link>
            ))
          ) : (
            <p className="p-5 text-sm text-zinc-600">No reports are queued.</p>
          )}
        </div>
      </section>
    </main>
  );
}
