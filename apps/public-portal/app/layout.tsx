import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "GAMAD | Portail",
  description:
    "Portail GAMAD pour rechercher des articles, ressources, services, formations et modules publics."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
