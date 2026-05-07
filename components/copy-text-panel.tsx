"use client";

import { useState } from "react";

export function CopyTextPanel({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [message, setMessage] = useState("");

  async function copyValue() {
    await navigator.clipboard.writeText(value);
    setMessage(`Copied ${label}.`);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
          {label}
        </p>
        <button type="button" onClick={copyValue} className="button-secondary">
          Copy
        </button>
      </div>
      <textarea
        readOnly
        value={value}
        className="mt-3 h-96 w-full rounded-md border border-[var(--rule)] bg-[var(--steel)] p-3 font-mono text-xs leading-5 text-[var(--ink)] [overflow-wrap:anywhere]"
      />
      {message ? (
        <p className="mt-2 text-sm text-[var(--green)]">{message}</p>
      ) : null}
    </div>
  );
}
