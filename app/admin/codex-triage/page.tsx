import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth";

type CodexTriageDraftRow = {
  id: string;
  title: string;
  status: string;
  report_ids: string[];
  created_at: string;
  updated_at: string;
};

type ModerationDraftRow = {
  id: string;
  metadata: {
    title?: unknown;
    reportIds?: unknown;
    fallbackStore?: unknown;
  };
  created_at: string;
};

type DraftListRow = CodexTriageDraftRow & {
  store: "codex_triage_drafts" | "moderation_events";
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function fallbackDraftFromEvent(event: ModerationDraftRow): DraftListRow {
  const reportIds = Array.isArray(event.metadata.reportIds)
    ? event.metadata.reportIds.filter(
        (value): value is string => typeof value === "string",
      )
    : [];
  const title =
    typeof event.metadata.title === "string"
      ? event.metadata.title
      : `Codex triage draft ${event.id}`;

  return {
    id: event.id,
    title,
    status: "prepared",
    report_ids: reportIds,
    created_at: event.created_at,
    updated_at: event.created_at,
    store: "moderation_events",
  };
}

export default async function CodexTriageDraftsPage() {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  const supabase = createServiceClient();
  const { data: tableDrafts, error: tableError } = await supabase
    .from("codex_triage_drafts")
    .select("id,title,status,report_ids,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<CodexTriageDraftRow[]>();
  const drafts: DraftListRow[] = tableError
    ? (
        (
          await supabase
            .from("moderation_events")
            .select("id,metadata,created_at")
            .eq("action", "codex_triage_draft_prepared")
            .order("created_at", { ascending: false })
            .limit(100)
            .returns<ModerationDraftRow[]>()
        ).data ?? []
      ).map(fallbackDraftFromEvent)
    : (tableDrafts ?? []).map((draft) => ({
        ...draft,
        store: "codex_triage_drafts" as const,
      }));

  return (
    <main className="support-shell-wide">
      <section className="support-panel">
        <div className="support-panel-header">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              Admin home
            </Link>
            <Link
              href="/admin/account"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              Account settings
            </Link>
            <Link
              href="/admin/reports"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              Report queue
            </Link>
          </div>
          <p className="kicker mt-8">Owner review</p>
          <h1 className="hero-title">Codex triage drafts.</h1>
          <p className="subtitle">
            Review owner-triggered draft bundles before anything changes in the
            customer-visible support queue.
          </p>
        </div>

        <div className="p-4">
          <div className="overflow-hidden rounded-lg border border-[var(--rule)] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead className="bg-[var(--steel)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Draft</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Reports</th>
                    <th className="px-4 py-3">Prepared</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {drafts?.length ? (
                    drafts.map((draft) => (
                      <tr
                        key={draft.id}
                        className="align-top transition-colors hover:bg-[var(--green-soft)]"
                      >
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/codex-triage/${draft.id}`}
                            className="font-semibold text-[var(--ink)] underline-offset-4 hover:underline"
                          >
                            {draft.title}
                          </Link>
                          <p className="mt-2 font-mono text-xs text-[var(--muted)]">
                            {draft.id} / {draft.store}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full border border-[var(--rule)] bg-[var(--green-soft)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
                            {draft.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[var(--muted)]">
                          {draft.report_ids.length}
                        </td>
                        <td className="px-4 py-4 text-[var(--muted)]">
                          <time dateTime={draft.created_at}>
                            {formatDate(draft.created_at)}
                          </time>
                        </td>
                        <td className="px-4 py-4 text-[var(--muted)]">
                          <time dateTime={draft.updated_at}>
                            {formatDate(draft.updated_at)}
                          </time>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-8 text-sm text-[var(--muted)]"
                        colSpan={5}
                      >
                        No Codex triage drafts have been prepared yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
