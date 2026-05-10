import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  ["Dashboard", "/dashboard"],
  ["Membres", "/members"],
  ["Organisation", "/organization"],
  ["Documents", "/documents"],
  ["Activites", "/activities"],
  ["Audit", "/audit"]
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">G</span>
          <span>
            <strong>GAMAD</strong>
            <small>HUB CORE</small>
          </span>
        </div>
        <nav className="sidebar-nav" aria-label="Navigation principale">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">CORE MVP</span>
            <strong>Gouvernance interne</strong>
          </div>
          <div className="topbar-context">Organisation active</div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
