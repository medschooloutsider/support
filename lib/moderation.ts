import type { ReportStatus } from "@/lib/schema";

const transitions: Record<ReportStatus, ReportStatus[]> = {
  new: ["needs_info", "merged", "published", "closed"],
  needs_info: ["new", "merged", "published", "closed"],
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

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function buildPublicIssueSlug(title: string, reportId: string): string {
  const prefix = slugify(title).slice(0, 64) || "support-issue";
  const suffix = reportId.split("-")[0] ?? reportId;

  return `${prefix}-${suffix}`;
}
