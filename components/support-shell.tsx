import Link from "next/link";

const navItems = [
  { href: "/", label: "Support" },
  { href: "/issues", label: "Issues" },
  { href: "/report", label: "Report" },
];

export function SupportShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark">MSO</span>
          <span>PDF-MD Support</span>
        </Link>
        <nav className="site-tabs" aria-label="Primary">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div id="main-content">{children}</div>
      <footer className="site-footer">
        <span>PDF-MD support: questions, support requests, and issue reports.</span>
        <span>Private diagnostics stay private until reviewed.</span>
      </footer>
    </>
  );
}
