import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GAMAD HUB',
  description: 'Espace souverain des citoyens GAMAD',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
