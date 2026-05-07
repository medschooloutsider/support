import { LoginForm } from "@/components/login-form";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = searchParams ? await searchParams : {};
  const message =
    query.message === "password_changed"
      ? "Password changed. Sign in again with the new password."
      : null;

  return (
    <main className="support-shell">
      {message ? (
        <div
          role="status"
          className="fixed right-4 top-4 z-50 max-w-sm rounded-lg border border-[var(--rule)] bg-white px-4 py-3 text-sm font-semibold text-[var(--green)] shadow-[var(--shadow)]"
        >
          {message}
        </div>
      ) : null}
      <section className="support-panel mx-auto max-w-2xl">
        <div className="support-panel-header">
        <p className="kicker">
          Owner access
        </p>
        <h1 className="hero-title">
          Support admin login
        </h1>
        <p className="subtitle">
          Sign in to review private support reports and publish issue updates.
        </p>
        </div>
        <div className="p-4">
        {message ? (
          <p className="mb-4 rounded-md border border-[var(--rule)] bg-[var(--green-soft)] px-3 py-2 text-sm font-medium text-[var(--green)]">
            {message}
          </p>
        ) : null}
        <LoginForm />
        </div>
      </section>
    </main>
  );
}
