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
    <span className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700">
      {STATUS_LABELS[status]}
    </span>
  );
}
