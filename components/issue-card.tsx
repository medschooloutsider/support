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
      className="block rounded-md border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {appId}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-950">{title}</h2>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{summary}</p>
      <p className="mt-4 text-xs text-zinc-500">Updated {formattedDate}</p>
    </Link>
  );
}
