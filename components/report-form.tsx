"use client";

import { useActionState } from "react";

import {
  type ReportFormState,
  submitWebReport,
} from "@/app/(public)/report/actions";

const initialState: ReportFormState = {
  message: "",
};

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-[var(--rule-dark)] bg-white px-3 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--green)]";

const textareaClassName =
  "mt-2 min-h-28 w-full rounded-md border border-[var(--rule-dark)] bg-white px-3 py-2 text-sm leading-6 text-[var(--ink)] outline-none transition-colors focus:border-[var(--green)]";

const labelClassName = "text-sm font-medium text-[var(--ink)]";

export function ReportForm() {
  const [state, formAction, isPending] = useActionState(
    submitWebReport,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClassName}>
          App
          <select name="appId" required className={inputClassName} defaultValue="">
            <option value="" disabled>
              Select an app
            </option>
            <option value="gpt_md">GPT-MD</option>
            <option value="pdf_md">PDF-MD</option>
            <option value="alarmist">Alarmist</option>
          </select>
        </label>

        <label className={labelClassName}>
          App version
          <input
            name="appVersion"
            required
            maxLength={80}
            className={inputClassName}
            placeholder="PDF-MD 1.0.1"
          />
        </label>

        <label className={labelClassName}>
          Platform
          <input
            name="platform"
            required
            maxLength={80}
            className={inputClassName}
            placeholder="macOS"
          />
        </label>

        <label className={labelClassName}>
          OS version
          <input
            name="osVersion"
            required
            maxLength={80}
            className={inputClassName}
            placeholder="15.4"
          />
        </label>

        <label className={labelClassName}>
          Email
          <input
            name="reporterEmail"
            required
            type="email"
            maxLength={320}
            className={inputClassName}
            placeholder="you@example.com"
          />
        </label>

        <label className={labelClassName}>
          License key
          <input
            name="licenseKey"
            autoComplete="off"
            className={inputClassName}
            placeholder="Optional, used only for purchase verification"
          />
        </label>

        <label className={labelClassName}>
          Request type
          <select name="category" className={inputClassName} defaultValue="other">
            <option value="other">Question or general support</option>
            <option value="bug">Bug report</option>
            <option value="bad_output">PDF-MD output or OCR problem</option>
            <option value="missing_feature">Feature request</option>
            <option value="purchase_access">Purchase or App Store access</option>
            <option value="safety">Safety or privacy concern</option>
          </select>
        </label>
      </div>

      <label className={labelClassName}>
        Summary
        <input
          name="summary"
          required
          minLength={8}
          maxLength={160}
          className={inputClassName}
          placeholder="Short description of the issue"
        />
      </label>

      <label className={labelClassName}>
        Description
        <textarea
          name="description"
          required
          minLength={20}
          maxLength={5000}
          className={textareaClassName}
          placeholder="For PDF-MD, describe the file type, selected route, output problem, or support question."
        />
      </label>

      <label className={labelClassName}>
        Reproduction steps
        <textarea
          name="reproductionSteps"
          required
          minLength={8}
          maxLength={5000}
          className={textareaClassName}
          placeholder="Example: Open PDF-MD, add the PDF, choose Hybrid, preview pages 1-3, export Markdown."
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClassName}>
          Expected result
          <textarea
            name="expectedResult"
            required
            minLength={3}
            maxLength={1000}
            className={textareaClassName}
          />
        </label>

        <label className={labelClassName}>
          Actual result
          <textarea
            name="actualResult"
            required
            minLength={3}
            maxLength={1000}
            className={textareaClassName}
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isPending}
          className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Submitting" : "Submit report"}
        </button>
        {state.message ? (
          <p className="text-sm leading-6 text-[var(--muted)]">{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
