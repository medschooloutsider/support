"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { bulkSetReportStatusAction } from "@/app/admin/reports/actions";

type ReportQueueRow = {
  id: string;
  app_id: string;
  app_name: string | null;
  app_version: string;
  app_build: string | null;
  category: string | null;
  source: string;
  status: string;
  summary: string;
  reporter_email: string;
  platform: string;
  created_at: string;
  updated_at: string;
};

const statusLabels: Record<string, string> = {
  new: "New",
  needs_info: "Needs info",
  merged: "Merged",
  published: "Published",
  closed: "Closed",
  unverified: "Unverified",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminReportBatchTable({
  reports,
  returnPath,
}: {
  reports: ReportQueueRow[];
  returnPath: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = reports.length > 0 && selected.size === reports.length;
  const selectedCount = selected.size;
  const selectedReports = useMemo(
    () => reports.filter((report) => selected.has(report.id)),
    [reports, selected],
  );
  const selectedStatusSummary =
    selectedReports.length === 0
      ? "No rows selected"
      : Array.from(new Set(selectedReports.map((report) => report.status)))
          .map((status) => statusLabels[status] ?? status)
          .join(", ");

  function toggleAll() {
    setSelected((current) =>
      current.size === reports.length
        ? new Set()
        : new Set(reports.map((report) => report.id)),
    );
  }

  function toggleOne(reportId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(reportId)) {
        next.delete(reportId);
      } else {
        next.add(reportId);
      }

      return next;
    });
  }

  return (
    <form action={bulkSetReportStatusAction} className="flex flex-col gap-4">
      <input type="hidden" name="returnPath" value={returnPath} />
      {Array.from(selected).map((reportId) => (
        <input key={reportId} type="hidden" name="reportId" value={reportId} />
      ))}

      <div className="flex flex-col gap-3 rounded-lg border border-[var(--rule)] bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
            Batch actions
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {selectedCount} selected / {selectedStatusSummary}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            name="nextStatus"
            defaultValue="needs_info"
            className="h-11 rounded-md border border-[var(--rule-dark)] bg-white px-3 text-sm text-[var(--ink)]"
          >
            <option value="new">Mark new</option>
            <option value="needs_info">Needs info</option>
            <option value="closed">Close</option>
          </select>
          <button
            type="submit"
            disabled={selectedCount === 0}
            className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply to selected
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--rule)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-[var(--steel)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all visible reports"
                    className="size-4 rounded border-[var(--rule-dark)]"
                  />
                </th>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">App</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)]">
              {reports.length ? (
                reports.map((report) => {
                  const checked = selected.has(report.id);
                  return (
                    <tr
                      key={report.id}
                      className="align-top transition-colors hover:bg-[var(--green-soft)]"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(report.id)}
                          aria-label={`Select ${report.summary}`}
                          className="size-4 rounded border-[var(--rule-dark)]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/reports/${report.id}`}
                          className="font-semibold text-[var(--ink)] underline-offset-4 hover:underline"
                        >
                          {report.summary}
                        </Link>
                        <p className="mt-2 max-w-2xl text-xs leading-5 text-[var(--muted)]">
                          {report.category ?? "uncategorized"} / {report.source} /{" "}
                          {report.platform}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-[var(--ink)]">
                          {report.app_name ?? report.app_id}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {report.app_version}
                          {report.app_build ? ` (${report.app_build})` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full border border-[var(--rule)] bg-[var(--green-soft)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
                          {statusLabels[report.status] ?? report.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[var(--muted)]">
                        {report.reporter_email}
                      </td>
                      <td className="px-4 py-4 text-[var(--muted)]">
                        <time dateTime={report.created_at}>
                          {formatDate(report.created_at)}
                        </time>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-4 py-8 text-sm text-[var(--muted)]" colSpan={6}>
                    No reports match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}
