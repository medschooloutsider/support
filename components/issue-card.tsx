import Link from "next/link";
import type { PublicStatus } from "@/lib/schema";
import { StatusBadge } from "@/components/status-badge";

type IssueCardProps = {
  slug: string;
  appId: string;
  title: string;
  summary: string;
  status: PublicStatus;
  updatedAt: string;
};

export function IssueCard({
  slug,
  appId,
  title,
  summary,
  status,
  updatedAt,
}: IssueCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(updatedAt));

  return (
    <Link
      href={`/issues/${slug}`}
      className="block rounded-md border border-[var(--rule)] bg-white p-5 transition-colors hover:border-[var(--rule-dark)] hover:bg-[var(--green-soft)]"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
            {appId}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--ink)]">{title}</h2>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{summary}</p>
      <p className="mt-4 text-xs text-[var(--muted)]">Updated {formattedDate}</p>
    </Link>
  );
}
