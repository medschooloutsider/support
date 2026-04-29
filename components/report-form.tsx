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
  "mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition-colors focus:border-zinc-950";

const textareaClassName =
  "mt-2 min-h-28 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-6 text-zinc-950 outline-none transition-colors focus:border-zinc-950";

const labelClassName = "text-sm font-medium text-zinc-950";

export function ReportForm() {
  const [state, formAction, isPending] = useActionState(
    submitWebReport,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-6">
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
            placeholder="1.0.0"
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
            placeholder="Optional for Alarmist"
          />
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
          className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isPending ? "Submitting" : "Submit report"}
        </button>
        {state.message ? (
          <p className="text-sm leading-6 text-zinc-600">{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
