import Link from "next/link";
import type { ReactNode } from "react";
import { footerColumns, mainNavigation } from "../lib/portal-content";

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="GAMAD accueil">
          <span className="brand-mark" aria-hidden="true">G</span>
          <span>
            <strong>GAMAD</strong>
            <small>Portail</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigation principale">
          {mainNavigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <nav className="mobile-nav" aria-label="Navigation mobile">
          {mainNavigation
            .filter((item) => item.mobile)
            .map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="footer-intro">
          <strong>GAMAD</strong>
          <p>Portail d'information, de ressources et de services numériques.</p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.title}>
            <strong>{column.title}</strong>
            {column.links.map((link) => (
              <Link href={link.includes("Connexion") || link.includes("compte") ? "/connexion" : "/"} key={link}>
                {link}
              </Link>
            ))}
          </div>
        ))}
        <p className="copyright">© GAMAD</p>
      </footer>
    </>
  );
}
