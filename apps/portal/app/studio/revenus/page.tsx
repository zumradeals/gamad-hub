'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { authGet, getToken } from '../../../lib/api';

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  referenceId?: string;
  note?: string;
  createdAt: string;
  toId: string;
  fromId?: string;
}

interface Wallet {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

const VIDEO_REASONS = [
  'VIDEO_PUBLISHED', 'VIDEO_WATCHED', 'VIDEO_LIKED',
  'VIDEO_MILESTONE_100', 'VIDEO_MILESTONE_1K', 'VIDEO_MILESTONE_10K',
  'VIDEO_COMMENT',
];

const REASON_META: Record<string, { label: string; icon: string; color: string }> = {
  VIDEO_PUBLISHED:      { label: 'Vidéo publiée',     icon: '🎬', color: '#0E9F4B' },
  VIDEO_WATCHED:        { label: 'Vidéo regardée',    icon: '▶',  color: '#1696D2' },
  VIDEO_LIKED:          { label: 'Like reçu/donné',   icon: '♥',  color: '#E5C100' },
  VIDEO_MILESTONE_100:  { label: 'Palier 100 vues',   icon: '🥉', color: '#0E9F4B' },
  VIDEO_MILESTONE_1K:   { label: 'Palier 1 000 vues', icon: '🥈', color: '#0E9F4B' },
  VIDEO_MILESTONE_10K:  { label: 'Palier 10 000 vues',icon: '🥇', color: '#E5C100' },
  VIDEO_COMMENT:        { label: 'Commentaire vidéo', icon: '💬', color: '#1696D2' },
  ARTICLE_PUBLISHED:    { label: 'Article publié',    icon: '📰', color: '#0E9F4B' },
  ARTICLE_READ:         { label: 'Article lu',        icon: '📖', color: '#1696D2' },
  ARTICLE_LIKED:        { label: 'Article aimé',      icon: '♥',  color: '#E5C100' },
  ARTICLE_MILESTONE_100:{ label: 'Palier 100 vues',   icon: '🏅', color: '#0E9F4B' },
  ARTICLE_MILESTONE_1K: { label: 'Palier 1 000 vues', icon: '🥈', color: '#0E9F4B' },
  REGISTRATION_BONUS:   { label: 'Bonus d\'inscription', icon: '🎁', color: '#E5C100' },
  CONTENT_PUBLISHED:    { label: 'Contenu publié',    icon: '📝', color: '#0E9F4B' },
  COMMENT_REWARD:       { label: 'Commentaire',       icon: '💬', color: '#1696D2' },
  REACTION_RECEIVED:    { label: 'Réaction reçue',    icon: '⭐', color: '#E5C100' },
  MANUAL_CREDIT:        { label: 'Crédit manuel',     icon: '💳', color: '#6B7280' },
};

type FilterType = 'all' | 'video' | 'blog' | 'other';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function StudioRevenusPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('video');

  useEffect(() => {
    if (!getToken()) { router.replace('/connexion'); return; }
    Promise.all([
      authGet<Transaction[]>('/portal/wallet/transactions'),
      authGet<{ wallet: Wallet }>('/portal/wallet'),
    ]).then(([txs, walletData]) => {
      setTransactions(txs);
      setWallet(walletData.wallet);
      setLoading(false);
    }).catch(() => router.replace('/connexion'));
  }, [router]);

  const filtered = transactions.filter(tx => {
    if (filter === 'all')   return true;
    if (filter === 'video') return VIDEO_REASONS.includes(tx.reason);
    if (filter === 'blog')  return tx.reason.startsWith('ARTICLE_');
    return !VIDEO_REASONS.includes(tx.reason) && !tx.reason.startsWith('ARTICLE_');
  });

  const videoEarnings = transactions
    .filter(tx => VIDEO_REASONS.includes(tx.reason) && tx.amount > 0)
    .reduce((s, tx) => s + tx.amount, 0);

  const blogEarnings = transactions
    .filter(tx => tx.reason.startsWith('ARTICLE_') && tx.amount > 0)
    .reduce((s, tx) => s + tx.amount, 0);

  return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: '#f0f2f5' }}>

        <div style={{ background: '#071326', padding: '2rem 2rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              <Link href="/studio" style={{ color: '#9ca3af', textDecoration: 'none' }}>Studio</Link> › Revenus
            </p>
            <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>💰 Revenus ZAHAB</h1>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem' }}>

          {/* Studio nav */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { href: '/studio',         label: '📊 Tableau de bord' },
              { href: '/studio/videos',  label: '🎬 Mes vidéos' },
              { href: '/studio/chaine',  label: '📺 Ma chaîne' },
              { href: '/studio/revenus', label: '💰 Revenus', active: true },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: '0.5rem 1rem', borderRadius: 8, textDecoration: 'none',
                background: (l as any).active ? '#071326' : '#fff',
                color: (l as any).active ? '#fff' : '#6B7280',
                border: `1px solid ${(l as any).active ? '#071326' : '#E5E7EB'}`,
                fontSize: '0.875rem', fontWeight: (l as any).active ? 700 : 400,
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          {loading && <p style={{ color: '#6B7280' }}>Chargement…</p>}

          {!loading && (
            <>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Solde actuel',        value: `${wallet?.balance.toFixed(2) ?? '0.00'} Z`, icon: '💰', accent: true },
                  { label: 'Total gagné',          value: `${wallet?.totalEarned.toFixed(2) ?? '0.00'} Z`, icon: '⬆', accent: false },
                  { label: 'Revenus GamadTube',   value: `${videoEarnings.toFixed(2)} Z`, icon: '🎬', accent: false },
                  { label: 'Revenus GAMAD Blog',  value: `${blogEarnings.toFixed(2)} Z`, icon: '📰', accent: false },
                ].map(s => (
                  <div key={s.label} style={{
                    background: s.accent ? '#071326' : '#fff',
                    border: `1px solid ${s.accent ? '#071326' : '#E5E7EB'}`,
                    borderRadius: 12, padding: '1.25rem',
                  }}>
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: s.accent ? '#E5C100' : '#071326', fontFamily: 'JetBrains Mono, monospace' }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: s.accent ? '#9ca3af' : '#6B7280', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem' }}>
                {[
                  { key: 'video', label: '🎬 GamadTube' },
                  { key: 'blog',  label: '📰 Blog' },
                  { key: 'other', label: 'Autres' },
                  { key: 'all',   label: 'Tout' },
                ].map(t => (
                  <button key={t.key} onClick={() => setFilter(t.key as FilterType)}
                    style={{
                      padding: '0.375rem 0.875rem', borderRadius: 20, border: 'none', cursor: 'pointer',
                      background: filter === t.key ? '#071326' : '#fff',
                      color: filter === t.key ? '#fff' : '#6B7280',
                      fontSize: '0.8125rem', fontWeight: filter === t.key ? 700 : 400,
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Transactions list */}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                    {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {filtered.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: '#6B7280' }}>Aucune transaction dans cette catégorie.</p>
                  </div>
                ) : (
                  <div>
                    {filtered.map((tx, idx) => {
                      const meta = REASON_META[tx.reason] ?? { label: tx.reason, icon: '·', color: '#6B7280' };
                      const isCredit = tx.amount > 0;
                      return (
                        <div key={tx.id} style={{
                          display: 'flex', alignItems: 'center', gap: '1rem',
                          padding: '0.875rem 1.25rem',
                          borderBottom: idx < filtered.length - 1 ? '1px solid #E5E7EB' : 'none',
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: `${meta.color}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.0625rem',
                          }}>
                            {meta.icon}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, color: '#071326', fontSize: '0.9375rem', marginBottom: 2 }}>
                              {meta.label}
                            </p>
                            {tx.note && (
                              <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{tx.note}</p>
                            )}
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(tx.createdAt)}</p>
                          </div>

                          <span style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: isCredit ? '#0E9F4B' : '#ef4444',
                          }}>
                            {isCredit ? '+' : '-'}{Math.abs(tx.amount).toFixed(2)} Z
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Link to full wallet */}
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link href="/dashboard/wallet" style={{ fontSize: '0.875rem', color: '#1696D2', textDecoration: 'none' }}>
                  Voir le wallet complet →
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
