import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "GAMAD | Portail public",
  description:
    "Portail public GAMAD pour découvrir la vision, l’écosystème, la transmission et les accès publics."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
