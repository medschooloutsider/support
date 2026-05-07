import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="support-shell">
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
        <LoginForm />
        </div>
      </section>
    </main>
  );
}
