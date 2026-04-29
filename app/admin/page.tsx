import Link from "next/link";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth";

export default async function AdminPage() {
  const owner = await requireOwner();

  if (!owner.allowed) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          {owner.email}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Support admin
        </h1>
        <div className="mt-8">
          <Link
            href="/admin/reports"
            className="inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            View report queue
          </Link>
        </div>
      </section>
    </main>
  );
}
