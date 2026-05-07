"use client";

import { useActionState } from "react";

import {
  changeOwnerPassword,
  type PasswordChangeState,
} from "@/app/admin/account/actions";

const initialState: PasswordChangeState = {
  message: "",
  status: "idle",
};

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-[var(--rule-dark)] bg-white px-3 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--green)]";

export function PasswordChangeForm() {
  const [state, formAction, isPending] = useActionState(
    changeOwnerPassword,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="block text-sm font-medium text-[var(--ink)]">
        Current password
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClassName}
        />
      </label>
      <label className="block text-sm font-medium text-[var(--ink)]">
        New password
        <input
          name="nextPassword"
          type="password"
          required
          minLength={16}
          autoComplete="new-password"
          className={inputClassName}
        />
      </label>
      <label className="block text-sm font-medium text-[var(--ink)]">
        Confirm new password
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={16}
          autoComplete="new-password"
          className={inputClassName}
        />
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isPending}
          className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Changing password" : "Change password"}
        </button>
        {state.message ? (
          <p
            className={
              state.status === "success"
                ? "text-sm leading-6 text-[var(--green)]"
                : "text-sm leading-6 text-[var(--warning)]"
            }
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
