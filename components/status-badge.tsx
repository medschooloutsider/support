import type { PublicStatus } from "@/lib/schema";

const STATUS_LABELS: Record<PublicStatus, string> = {
  known: "Known",
  being_resolved: "Being resolved",
  to_be_resolved: "To be resolved",
};

type StatusBadgeProps = {
  status: PublicStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--rule)] bg-[var(--green-soft)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-[var(--green)]">
      {STATUS_LABELS[status]}
    </span>
  );
}
