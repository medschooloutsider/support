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
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">Support issues</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
          Reviewed public status for GPT-MD, PDF-MD, and Alarmist.
        </p>
        <div className="mt-8 space-y-4">
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
            <p className="rounded-md border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
              No public support issues have been published yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
