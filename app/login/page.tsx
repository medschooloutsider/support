import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-md">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Owner access
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Support admin login
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          Sign in to review private support reports and publish issue updates.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
