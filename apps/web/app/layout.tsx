import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "GAMAD HUB CORE",
  description: "Noyau MVP du GAMAD HUB"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
