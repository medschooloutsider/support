import Link from "next/link";

export default function Home() {
  return (
    <main className="support-shell">
      <section className="support-panel">
        <div className="support-panel-header">
          <p className="kicker">Private intake / public status</p>
          <h1 className="hero-title">Support without leaking diagnostics.</h1>
          <p className="subtitle">
            Reviewed technical support status for GPT-MD, PDF-MD, and Alarmist,
            with raw reports held for owner review.
          </p>
        </div>
        <div className="card-grid">
          <section className="support-card support-card-soft">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Public issues
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Read reviewed, grouped issue status without exposing private
              report packets.
            </p>
          </section>
          <section className="support-card">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Private reports
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Submit app details, reproduction notes, and diagnostics for owner
              triage.
            </p>
          </section>
          <section className="support-card">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Owner review
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Triage, close, request info, or publish summarized public issue
              updates.
            </p>
          </section>
        </div>
        <div className="flex flex-col gap-3 border-t border-[var(--rule)] p-4 sm:flex-row">
          <Link
            href="/issues"
            className="button-primary"
          >
            View Issues
          </Link>
          <Link
            href="/report"
            className="button-secondary"
          >
            Report Issue
          </Link>
        </div>
      </section>
    </main>
  );
}
