import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CopyTextPanel } from "@/components/copy-text-panel";
import {
  buildCodexTriageBundle,
  type CodexTriageInputPayload,
} from "@/lib/codex-triage";
import { requireOwner } from "@/lib/auth";

type CodexTriageDraftRow = {
  id: string;
  title: string;
  status: string;
  prompt: string;
  policy: unknown;
  requested_output: unknown;
  input_payload: CodexTriageInputPayload;
  codex_output: unknown | null;
  owner_notes: string | null;
  report_ids: string[];
  created_at: string;
  updated_at: string;
};

type ModerationDraftRow = {
  id: string;
  metadata: {
    title?: unknown;
    prompt?: unknown;
    policy?: unknown;
    requestedOutput?: unknown;
    payload?: unknown;
    reportIds?: unknown;
  };
  created_at: string;
};

type DraftView = CodexTriageDraftRow & {
  store: "codex_triage_drafts" | "moderation_events";
};

type ReportLinkRow = {
  id: string;
  summary: string;
  app_name: string | null;
  app_id: string;
  status: string;
};

type CodexTriageDraftPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

function getSingleParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];

  return Array.isArray(value) ? value[0] : value;
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function isCodexTriageInputPayload(value: unknown): value is CodexTriageInputPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { policy?: unknown; requestedOutput?: unknown; reports?: unknown };

  return (
    typeof candidate.policy === "object" &&
    typeof candidate.requestedOutput === "object" &&
    Array.isArray(candidate.reports)
  );
}

function fallbackDraftFromEvent(event: ModerationDraftRow | null): DraftView | null {
  if (!event) {
    return null;
  }

  if (!isCodexTriageInputPayload(event.metadata.payload)) {
    return null;
  }

  const reportIds = Array.isArray(event.metadata.reportIds)
    ? event.metadata.reportIds.filter(
        (value): value is string => typeof value === "string",
      )
    : [];
  const title =
    typeof event.metadata.title === "string"
      ? event.metadata.title
      : `Codex triage draft ${event.id}`;
  const prompt =
    typeof event.metadata.prompt === "string"
      ? event.metadata.prompt
      : "Review this owner-triggered support triage bundle.";

  return {
    id: event.id,
    title,
    status: "prepared",
    prompt,
    policy: event.metadata.policy ?? event.metadata.payload.policy,
    requested_output:
      event.metadata.requestedOutput ?? event.metadata.payload.requestedOutput,
    input_payload: event.metadata.payload,
    codex_output: null,
    owner_notes: null,
    report_ids: reportIds,
    created_at: event.created_at,
    updated_at: event.created_at,
    store: "moderation_events",
  };
}

export default async function CodexTriageDraftPage({
  params,
  searchParams,
}: CodexTriageDraftPageProps) {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const supabase = createServiceClient();
  const { data: tableDraft } = await supabase
    .from("codex_triage_drafts")
    .select(
      "id,title,status,prompt,policy,requested_output,input_payload,codex_output,owner_notes,report_ids,created_at,updated_at",
    )
    .eq("id", id)
    .maybeSingle()
    .returns<CodexTriageDraftRow | null>();
  const draft: DraftView | null = tableDraft
    ? { ...tableDraft, store: "codex_triage_drafts" }
    : fallbackDraftFromEvent(
        (
          await supabase
            .from("moderation_events")
            .select("id,metadata,created_at")
            .eq("id", id)
            .eq("action", "codex_triage_draft_prepared")
            .maybeSingle()
            .returns<ModerationDraftRow | null>()
        ).data,
      );

  if (!draft) {
    notFound();
  }

  const { data: reports } = draft.report_ids.length
    ? await supabase
        .from("reports")
        .select("id,summary,app_name,app_id,status")
        .in("id", draft.report_ids)
        .returns<ReportLinkRow[]>()
    : { data: [] };
  const bundle = buildCodexTriageBundle({
    draftId: draft.id,
    payload: draft.input_payload,
  });
  const notice =
    getSingleParam(query, "message") === "prepared"
      ? "Codex triage draft prepared. Review the bundle before taking any action."
      : null;

  return (
    <main className="support-shell-wide">
      <article className="support-panel">
        <div className="support-panel-header">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/codex-triage"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              Back to drafts
            </Link>
            <Link
              href="/admin/reports"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              Report queue
            </Link>
            <Link
              href="/admin/account"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              Account settings
            </Link>
          </div>
          {notice ? (
            <p className="mt-6 rounded-md border border-[var(--rule)] bg-[var(--green-soft)] px-4 py-3 text-sm font-medium text-[var(--green)]">
              {notice}
            </p>
          ) : null}
          <p className="kicker mt-8">{draft.status}</p>
          <h1 className="hero-title">{draft.title}</h1>
          <p className="subtitle">
            Draft-only Codex support triage. This page prepares review material;
            it does not close reports, publish public issues, or change
            customer-visible state.
          </p>
          <p className="mt-4 font-mono text-xs text-[var(--muted)]">
            Store: {draft.store}
          </p>
        </div>

        <div className="grid gap-4 border-b border-[var(--rule)] bg-white p-4 md:grid-cols-3">
          <div className="support-card support-card-soft">
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
              Reports
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
              {draft.report_ids.length}
            </p>
          </div>
          <div className="support-card">
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Prepared
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
              {formatDate(draft.created_at)}
            </p>
          </div>
          <div className="support-card">
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Updated
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
              {formatDate(draft.updated_at)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 bg-white p-6">
          <section className="rounded-lg border border-[var(--rule)] p-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
              Included reports
            </p>
            <div className="mt-3 grid gap-2">
              {reports?.length ? (
                reports.map((report) => (
                  <Link
                    key={report.id}
                    href={`/admin/reports/${report.id}`}
                    className="rounded-md border border-[var(--rule)] px-3 py-2 text-sm transition-colors hover:bg-[var(--green-soft)]"
                  >
                    <span className="font-semibold text-[var(--ink)]">
                      {report.summary}
                    </span>
                    <span className="ml-2 text-[var(--muted)]">
                      {report.app_name ?? report.app_id} / {report.status}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  No report rows are currently linked to this draft.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-[var(--rule)] p-4">
            <CopyTextPanel label="Codex bundle" value={bundle} />
          </section>

          <section className="grid gap-4 rounded-lg border border-[var(--rule)] p-4 lg:grid-cols-2">
            <CopyTextPanel label="Policy" value={formatJson(draft.policy)} />
            <CopyTextPanel
              label="Requested output"
              value={formatJson(draft.requested_output)}
            />
          </section>

          {draft.codex_output ? (
            <section className="rounded-lg border border-[var(--rule)] p-4">
              <CopyTextPanel
                label="Codex output"
                value={formatJson(draft.codex_output)}
              />
            </section>
          ) : null}
        </div>
      </article>
    </main>
  );
}
