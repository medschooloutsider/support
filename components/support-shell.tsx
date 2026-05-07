import Link from "next/link";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/issues", label: "Issues" },
  { href: "/report", label: "Report" },
  { href: "/admin/reports", label: "Admin" },
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
          <span>Med School Outsider Support</span>
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
        <span>Support hub for GPT-MD, PDF-MD, and Alarmist.</span>
        <span>Private diagnostics stay private until reviewed.</span>
      </footer>
    </>
  );
}
