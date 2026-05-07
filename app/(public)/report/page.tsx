import { ReportForm } from "@/components/report-form";

export default function ReportPage() {
  return (
    <main className="support-shell">
      <section className="support-panel">
        <div className="support-panel-header">
        <p className="kicker">Private intake</p>
        <h1 className="hero-title">
          Report an issue
        </h1>
        <p className="subtitle">
          Share what happened in GPT-MD, PDF-MD, or Alarmist. Reports are
          private until reviewed.
        </p>
        </div>
        <div className="p-4">
        <ReportForm />
        </div>
      </section>
    </main>
  );
}
