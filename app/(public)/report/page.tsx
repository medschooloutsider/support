import { ReportForm } from "@/components/report-form";

export default function ReportPage() {
  return (
    <main className="support-shell">
      <section className="support-panel">
        <div className="support-panel-header">
          <p className="kicker">Private support request</p>
          <h1 className="hero-title">
            Report an issue
          </h1>
          <p className="subtitle">
            Ask a question, request support, or share what happened in PDF-MD,
            GPT-MD, or Alarmist. PDF-MD requests can cover import, OCR,
            Markdown export, audits, purchase access, or App Store access.
          </p>
        </div>
        <div className="grid gap-4 border-b border-[var(--rule)] p-4 lg:grid-cols-3">
          <section className="support-card support-card-soft">
            <h2 className="text-base font-semibold text-[var(--ink)]">
              What to include
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Include your app version, macOS version, the PDF-MD workflow you
              used, and whether the problem is import, OCR, preview, export, or
              licensing.
            </p>
          </section>
          <section className="support-card">
            <h2 className="text-base font-semibold text-[var(--ink)]">
              Response time
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Reports are reviewed by the owner. Most requests should receive a
              first response or status update within 2 business days.
            </p>
          </section>
          <section className="support-card">
            <h2 className="text-base font-semibold text-[var(--ink)]">
              Privacy
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Reports stay private unless a reviewed public summary is created.
              Do not paste patient data, exam materials, or private documents.
            </p>
          </section>
        </div>
        <div className="p-4">
          <ReportForm />
        </div>
      </section>
    </main>
  );
}
