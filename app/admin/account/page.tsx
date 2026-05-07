import Link from "next/link";
import { redirect } from "next/navigation";

import { PasswordChangeForm } from "@/components/password-change-form";
import { requireOwner } from "@/lib/auth";

export default async function AdminAccountPage() {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  return (
    <main className="support-shell">
      <section className="support-panel mx-auto max-w-2xl">
        <div className="support-panel-header">
          <Link
            href="/admin"
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            Back to admin
          </Link>
          <p className="kicker mt-8">{owner.email}</p>
          <h1 className="hero-title">Account password</h1>
          <p className="subtitle">
            Change owner access without using Supabase recovery emails.
          </p>
        </div>
        <div className="p-4">
          <PasswordChangeForm />
        </div>
      </section>
    </main>
  );
}
