import type { ReportStatus } from "@/lib/schema";

const transitions: Record<ReportStatus, ReportStatus[]> = {
  new: ["needs_info", "merged", "published", "closed"],
  needs_info: ["merged", "published", "closed"],
  merged: ["closed"],
  published: ["closed"],
  closed: [],
  unverified: ["new", "closed"],
};

export function canTransitionReport(
  from: ReportStatus,
  to: ReportStatus,
): boolean {
  return transitions[from].includes(to);
}
