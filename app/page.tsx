import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="w-full max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Med School Outsider Support
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">
          Reviewed technical support status for GPT-MD, PDF-MD, and Alarmist.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/issues"
            className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            View Issues
          </Link>
          <Link
            href="/report"
            className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-zinc-950 transition-colors hover:bg-white"
          >
            Report Issue
          </Link>
        </div>
      </section>
    </main>
  );
}
