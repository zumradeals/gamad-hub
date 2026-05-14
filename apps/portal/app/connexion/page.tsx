'use client';
import { useEffect } from 'react';

export default function ConnexionPage() {
  useEffect(() => {
    window.location.href = process.env.NEXT_PUBLIC_CORE_URL ?? 'https://hub.gamad.net';
  }, []);

  return (
    <main style={{ background: '#f8f7f4', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ color: '#6b6b6b', fontSize: '0.875rem' }}>Redirection vers l'espace membre…</p>
    </main>
  );
}
