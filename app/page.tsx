import Link from "next/link";

export default function Home() {
  return (
    <main className="support-shell">
      <section className="support-panel">
        <div className="support-panel-header">
          <p className="kicker">PDF-MD support / app questions</p>
          <h1 className="hero-title">Med School Outsider Support</h1>
          <p className="subtitle">
            Ask questions, request support, or report issues for PDF-MD,
            GPT-MD, and Alarmist. PDF-MD users can get help with PDF import,
            OCR mode choice, Markdown export, audits, licensing, and App Store
            access.
          </p>
        </div>
        <div className="card-grid">
          <section className="support-card support-card-soft">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Contact path
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Use the support request form for questions, bug reports, purchase
              access problems, and feature requests. In PDF-MD, Help &gt; Report
              Issue can include app context when available.
            </p>
          </section>
          <section className="support-card">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Response expectations
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Support requests are reviewed by the app owner. Most support
              requests should receive a first response or status update within 2
              business days.
            </p>
          </section>
          <section className="support-card">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Privacy
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Raw reports, reporter email, reproduction notes, and diagnostics
              stay private for owner review. Public issue pages use reviewed
              summaries only.
            </p>
          </section>
        </div>
        <div className="grid gap-4 border-t border-[var(--rule)] p-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="support-card">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              PDF-MD help topics
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted)]">
              <li>Choosing Fast Text, Hybrid, OCR, or Heavy Audit routes.</li>
              <li>Handling scanned PDFs, slide decks, and image-heavy files.</li>
              <li>Reviewing Markdown output, audit sidecars, and diagnostics.</li>
              <li>Resolving export failures, licensing, or App Store access.</li>
            </ul>
          </section>
          <section className="support-card support-card-soft">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Public status
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Reviewed known issues are grouped publicly. If your report
              contains private files, document titles, logs, or purchase
              details, use the support form instead of a public issue.
            </p>
          </section>
        </div>
        <div className="flex flex-col gap-3 border-t border-[var(--rule)] p-4 sm:flex-row">
          <Link
            href="/report"
            className="button-primary"
          >
            Ask a Question or Request Support
          </Link>
          <Link
            href="/issues"
            className="button-secondary"
          >
            View Public Issues
          </Link>
          <Link
            href="https://github.com/medschooloutsider/support/issues"
            className="button-secondary"
          >
            Public GitHub Issues
          </Link>
        </div>
      </section>
    </main>
  );
}
