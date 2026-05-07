import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import type { PublicStatus } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";

type IssuePageProps = {
  params: Promise<{ slug: string }>;
};

type PublicIssueRow = {
  slug: string;
  app_id: string;
  title: string;
  summary: string;
  status: PublicStatus;
  affected_versions: string;
  affected_platforms: string;
  workaround: string | null;
  resolution_notes: string | null;
  updated_at: string;
};

export default async function IssuePage({ params }: IssuePageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: issue } = await supabase
    .from("public_issues")
    .select(
      "slug,app_id,title,summary,status,affected_versions,affected_platforms,workaround,resolution_notes,updated_at",
    )
    .eq("slug", slug)
    .maybeSingle()
    .returns<PublicIssueRow | null>();

  if (!issue) {
    notFound();
  }

  const formattedDate = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(issue.updated_at));

  return (
    <main className="support-shell">
      <article className="support-panel">
        <div className="support-panel-header">
        <Link
          href="/issues"
          className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        >
          Back to issues
        </Link>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="kicker">
              {issue.app_id}
            </p>
            <h1 className="hero-title">
              {issue.title}
            </h1>
          </div>
          <StatusBadge status={issue.status} />
        </div>
        <p className="mt-5 max-w-4xl text-base leading-7 text-[var(--muted)]">{issue.summary}</p>
        <p className="mt-4 text-sm text-[var(--muted)]">Updated {formattedDate}</p>
        </div>

        <div className="px-6 pb-8">
        <dl className="grid gap-6 border-b border-[var(--rule)] py-8 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-[var(--ink)]">
              Affected versions
            </dt>
            <dd className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {issue.affected_versions}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[var(--ink)]">
              Affected platforms
            </dt>
            <dd className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {issue.affected_platforms}
            </dd>
          </div>
        </dl>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Workaround</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {issue.workaround ?? "No workaround has been published yet."}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Resolution notes
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {issue.resolution_notes ??
              "Resolution notes have not been published yet."}
          </p>
        </section>
        </div>
      </article>
    </main>
  );
}
