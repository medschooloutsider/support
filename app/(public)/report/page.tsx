import { ReportForm } from "@/components/report-form";

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">
          Report an issue
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
          Share what happened in GPT-MD, PDF-MD, or Alarmist. Reports are
          private until reviewed.
        </p>
        <ReportForm />
      </section>
    </main>
  );
}
