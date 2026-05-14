'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { authGet, getToken } from '../../../lib/api';

interface Stats {
  totalViews: number;
  totalZahab: number;
  totalPublished: number;
  avgViews: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  moderationStatus: string;
  viewCount: number;
  rewardAmount: number;
  milestone100: boolean;
  milestone1k: boolean;
  publishedAt: string | null;
  createdAt: string;
  category?: { name: string } | null;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  DRAFT:     { label: 'Brouillon',  cls: 'badge-muted' },
  PUBLISHED: { label: 'Publié',     cls: 'badge-green' },
  ARCHIVED:  { label: 'Archivé',    cls: 'badge-muted' },
};

const MOD_LABELS: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'En modération', cls: 'badge-gold' },
  APPROVED: { label: 'Approuvé',      cls: 'badge-green' },
  REJECTED: { label: 'Refusé',        cls: 'badge-muted' },
  FLAGGED:  { label: 'Signalé',       cls: 'badge-muted' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.push('/connexion'); return; }
    Promise.all([
      authGet<Stats>('/portal/blog/me/stats'),
      authGet<Article[]>('/portal/blog/me/articles'),
    ])
      .then(([s, a]) => { setStats(s); setArticles(a); })
      .catch(() => router.push('/connexion'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <>
        <Nav />
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>Chargement…</p>
        </main>
      </>
    );
  }

  const published = articles.filter(a => a.status === 'PUBLISHED' && a.moderationStatus === 'APPROVED');
  const maxViews = published.length > 0 ? Math.max(...published.map(a => a.viewCount), 1) : 1;

  return (
    <>
      <Nav />
      <main style={{ padding: '2.5rem 2rem', minHeight: '80vh' }}>
        <div className="container">
          {/* Breadcrumb */}
          <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
            <Link href="/dashboard" style={{ color: 'var(--blue)' }}>Dashboard</Link>
            {' → '}
            <span>Espace Créateur</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.625rem' }}>Espace Créateur</h1>
            <Link href="/blog/new" className="btn btn-primary">
              ✍️ Écrire un article
            </Link>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card" style={{ background: 'var(--navy)', color: 'white', border: 'none' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ZAHAB gagnés
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
                {(stats?.totalZahab ?? 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>via articles</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Vues totales
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-mono)' }}>
                {(stats?.totalViews ?? 0).toLocaleString('fr-FR')}
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Articles publiés
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-mono)' }}>
                {stats?.totalPublished ?? 0}
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Vues / article
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-mono)' }}>
                {stats?.avgViews ?? 0}
              </div>
            </div>
          </div>

          {/* Graphique tendance */}
          {published.length > 0 && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '1.25rem' }}>Performance des articles</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 120 }}>
                {published.slice(0, 10).map(a => {
                  const pct = Math.max(4, Math.round((a.viewCount / maxViews) * 100));
                  return (
                    <div key={a.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                        {a.viewCount}
                      </div>
                      <div style={{ width: '100%', background: 'var(--gold)', borderRadius: '4px 4px 0 0', height: `${pct}%`, minHeight: 4, transition: 'height 0.3s' }} />
                      <div style={{ fontSize: '0.6rem', color: 'var(--muted)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                        {a.title.substring(0, 12)}…
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Jalons ZAHAB */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>Paliers de récompense</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { label: 'Article publié', amount: '+20 Z', icon: '📝', desc: 'À chaque article approuvé' },
                { label: '100 vues', amount: '+10 Z', icon: '👁️', desc: 'Palier 100 vues atteint' },
                { label: '1 000 vues', amount: '+50 Z', icon: '🚀', desc: 'Palier 1 000 vues atteint' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span>{r.icon}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{r.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.desc}</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green)', fontSize: '0.9375rem' }}>
                    {r.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Liste articles */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9375rem' }}>Mes articles</h3>
              <Link href="/blog/new" className="btn btn-outline" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}>
                Nouveau
              </Link>
            </div>

            {articles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✍️</div>
                <p style={{ marginBottom: '1rem', fontSize: '0.9375rem' }}>Vous n'avez encore aucun article.</p>
                <Link href="/blog/new" className="btn btn-primary">Écrire mon premier article</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {articles.map(a => {
                  const status = STATUS_LABELS[a.status] ?? STATUS_LABELS.DRAFT;
                  const mod = MOD_LABELS[a.moderationStatus] ?? MOD_LABELS.PENDING;
                  return (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.875rem 0', borderBottom: '1px solid var(--border)', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                          {a.status === 'PUBLISHED' && a.moderationStatus === 'APPROVED' ? (
                            <Link href={`/blog/${a.slug}`} style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--navy)' }}>
                              {a.title}
                            </Link>
                          ) : (
                            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--navy)' }}>{a.title}</span>
                          )}
                          <span className={`badge ${status.cls}`} style={{ fontSize: '0.6875rem' }}>{status.label}</span>
                          {a.status === 'PUBLISHED' && <span className={`badge ${mod.cls}`} style={{ fontSize: '0.6875rem' }}>{mod.label}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--muted)', flexWrap: 'wrap' }}>
                          {a.publishedAt && <span>{formatDate(a.publishedAt)}</span>}
                          <span>👁 {a.viewCount.toLocaleString('fr-FR')} vues</span>
                          {a.milestone100 && <span title="Palier 100 vues">🏅 100</span>}
                          {a.milestone1k && <span title="Palier 1 000 vues">🏆 1K</span>}
                          {a.category && <span>{a.category.name}</span>}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9375rem', color: a.rewardAmount > 0 ? 'var(--green)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {a.rewardAmount > 0 ? `+${a.rewardAmount.toFixed(2)} Z` : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
