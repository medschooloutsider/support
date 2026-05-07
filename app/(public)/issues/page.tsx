import { IssueCard } from "@/components/issue-card";
import type { PublicStatus } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";

type PublicIssueRow = {
  slug: string;
  app_id: string;
  title: string;
  summary: string;
  status: PublicStatus;
  updated_at: string;
};

export default async function IssuesPage() {
  const supabase = await createClient();
  const { data: issues } = await supabase
    .from("public_issues")
    .select("slug,app_id,title,summary,status,updated_at")
    .order("updated_at", { ascending: false })
    .returns<PublicIssueRow[]>();

  return (
    <main className="support-shell">
      <section className="support-panel">
        <div className="support-panel-header">
        <p className="kicker">Reviewed status</p>
        <h1 className="hero-title">Support issues</h1>
        <p className="subtitle">
          Reviewed public status for GPT-MD, PDF-MD, and Alarmist.
        </p>
        </div>
        <div className="flex flex-col gap-4 p-4">
          {issues?.length ? (
            issues.map((issue) => (
              <IssueCard
                key={issue.slug}
                slug={issue.slug}
                appId={issue.app_id}
                title={issue.title}
                summary={issue.summary}
                status={issue.status}
                updatedAt={issue.updated_at}
              />
            ))
          ) : (
            <p className="rounded-md border border-[var(--rule)] bg-white p-5 text-sm text-[var(--muted)]">
              No public support issues have been published yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
