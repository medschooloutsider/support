"use client";

import { useActionState } from "react";

import { loginOwner, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {
  message: "",
};

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-[var(--rule-dark)] bg-white px-3 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--green)]";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginOwner,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="block text-sm font-medium text-[var(--ink)]">
        Owner email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClassName}
        />
      </label>
      <label className="block text-sm font-medium text-[var(--ink)]">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClassName}
        />
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isPending}
          className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Signing in" : "Sign in"}
        </button>
        {state.message ? (
          <p className="text-sm leading-6 text-[var(--muted)]">{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
