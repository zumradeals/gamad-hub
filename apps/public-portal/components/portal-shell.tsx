import Link from "next/link";
import type { ReactNode } from "react";
import { mainNavigation } from "../lib/portal-content";

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="GAMAD accueil">
          <span className="brand-mark" aria-hidden="true">G</span>
          <span>
            <strong>GAMAD</strong>
            <small>Portail public</small>
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
        <div>
          <strong>GAMAD</strong>
          <p>Formation, travail, adoration au service de la transmission et de la continuité.</p>
        </div>
        <div>
          <strong>Navigation</strong>
          <Link href="/vision">Vision</Link>
          <Link href="/ecosysteme">Écosystème</Link>
          <Link href="/ressources">Ressources</Link>
        </div>
        <div>
          <strong>Contact</strong>
          <Link href="/contact">Formulaire public</Link>
          <Link href="/connexion">Accès membre</Link>
        </div>
        <p className="copyright">© GAMAD</p>
      </footer>
    </>
  );
}
