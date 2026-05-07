import Link from "next/link";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth";

export default async function AdminPage() {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  return (
    <main className="support-shell">
      <section className="support-panel">
        <div className="support-panel-header">
        <p className="kicker">
          {owner.email}
        </p>
        <h1 className="hero-title">
          Support admin
        </h1>
        <p className="subtitle">
          Review private reports, manage the queue, and publish summarized issue
          status.
        </p>
        </div>
        <div className="flex flex-col gap-3 border-t border-[var(--rule)] p-4 sm:flex-row">
          <Link
            href="/admin/reports"
            className="button-primary"
          >
            View report queue
          </Link>
          <Link
            href="/admin/codex-triage"
            className="button-secondary"
          >
            Codex triage drafts
          </Link>
          <Link
            href="/admin/account"
            className="button-secondary"
          >
            Account settings
          </Link>
        </div>
      </section>
    </main>
  );
}
