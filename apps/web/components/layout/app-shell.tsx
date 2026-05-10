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
        <div className="brand">GAMAD HUB CORE</div>
        <nav>
          {navItems.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
