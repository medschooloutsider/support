"use client";

import { useActionState } from "react";

import { loginOwner, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {
  message: "",
};

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition-colors focus:border-zinc-950";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginOwner,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block text-sm font-medium text-zinc-950">
        Owner email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClassName}
        />
      </label>
      <label className="block text-sm font-medium text-zinc-950">
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
          className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isPending ? "Signing in" : "Sign in"}
        </button>
        {state.message ? (
          <p className="text-sm leading-6 text-zinc-600">{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
