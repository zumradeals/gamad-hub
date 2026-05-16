'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { getToken, authGet, authPost } from '../../../lib/api';

const C = {
  gold:   '#E5C100',
  blue:   '#1696D2',
  green:  '#0E9F4B',
  navy:   '#071326',
  muted:  '#6B7280',
  border: '#E5E7EB',
  bg:     '#f0f2f5',
};

/* ── types ── */
type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'PENDING_REVIEW' | 'REJECTED';
interface Category { id: string; name: string }
interface MyArticle {
  id: string; slug: string; title: string; excerpt?: string;
  status: ArticleStatus;
  moderationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionNote?: string;
  viewCount?: number; likesCount?: number; readCount?: number;
  publishedAt?: string; updatedAt?: string; createdAt?: string;
  category?: Category;
}
interface BlogStats {
  totalPublished?: number;
  totalViews?: number;
  totalZahab?: number;
  totalReadRewarded?: number;
}

/* ── helpers ── */
function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Status badge ── */
function StatusBadge({ article }: { article: MyArticle }) {
  let label = '', bg = '', color = '';
  const isPendingMod = article.moderationStatus === 'PENDING';
  const isRejected   = article.status === 'REJECTED' || article.moderationStatus === 'REJECTED';

  if (isRejected) {
    label = 'Refusé'; bg = '#fee2e2'; color = '#991b1b';
  } else if (isPendingMod || article.status === 'PENDING_REVIEW') {
    label = 'En révision'; bg = '#fef3c7'; color = '#92400e';
  } else if (article.status === 'PUBLISHED') {
    label = 'Publié'; bg = '#d1fae5'; color = '#065f46';
  } else {
    label = 'Brouillon'; bg = '#F3F4F6'; color = C.muted;
  }
  return (
    <span style={{ background: bg, color, fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: 20 }}>{label}</span>
  );
}

/* ── Tab button ── */
function Tab({ label, active, count, onClick }: { label: string; active: boolean; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.625rem 1.25rem', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem',
        border: `2px solid ${active ? C.navy : C.border}`,
        background: active ? C.navy : '#fff',
        color: active ? '#fff' : C.muted,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}
    >
      {label}
      {count > 0 && (
        <span style={{ background: active ? 'rgba(255,255,255,0.2)' : C.border, color: active ? '#fff' : C.muted, fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 10 }}>{count}</span>
      )}
    </button>
  );
}

/* ── Stat card ── */
function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: C.navy, fontFamily: 'monospace' }}>{value}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: C.muted }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: C.green, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

/* ── Article card ── */
function ArticleCard({ article, onDelete, onSubmit }: {
  article: MyArticle;
  onDelete: (id: string) => void;
  onSubmit: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const isRejected   = article.status === 'REJECTED' || article.moderationStatus === 'REJECTED';
  const isPending    = article.moderationStatus === 'PENDING' || article.status === 'PENDING_REVIEW';
  const isDraft      = article.status === 'DRAFT';

  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`,
      padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <StatusBadge article={article} />
            {article.category && (
              <span style={{ background: '#EBF5FB', color: C.blue, fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 4 }}>{article.category.name}</span>
            )}
          </div>
          <h3 style={{ margin: '0 0 0.375rem', fontSize: '1rem', fontWeight: 700, color: C.navy, lineHeight: 1.35 }}>
            {article.status === 'PUBLISHED'
              ? <Link href={`/blog/${article.slug}`} style={{ color: C.navy, textDecoration: 'none' }}>{article.title}</Link>
              : article.title
            }
          </h3>
          {article.excerpt && (
            <p style={{ margin: 0, fontSize: '0.8125rem', color: C.muted, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {article.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Note de refus */}
      {isRejected && article.rejectionNote && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem', fontSize: '0.8125rem', color: '#991b1b' }}>
          <strong>Motif du refus :</strong> {article.rejectionNote}
        </div>
      )}

      {/* Méta stats */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: C.muted, paddingTop: '0.5rem', borderTop: `1px solid ${C.border}` }}>
        <span>📅 {formatDate(article.publishedAt ?? article.updatedAt ?? article.createdAt)}</span>
        {(article.viewCount ?? 0) > 0 && <span>👁 {article.viewCount!.toLocaleString('fr-FR')} vues</span>}
        {(article.likesCount ?? 0) > 0 && <span>❤️ {article.likesCount} likes</span>}
        {(article.readCount ?? 0) > 0 && <span style={{ color: C.green, fontWeight: 600 }}>📿 {article.readCount} lectures rémunérées</span>}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Link href={`/blog/ecrire?id=${article.id}`} style={{
          padding: '0.5rem 1rem', background: '#fff', color: C.navy,
          border: `1px solid ${C.border}`, borderRadius: 7,
          fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
        }}>✏️ Modifier</Link>

        {isDraft && (
          <button
            onClick={() => onSubmit(article.id)}
            style={{
              padding: '0.5rem 1rem', background: C.gold, color: C.navy,
              border: 'none', borderRadius: 7, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
            }}
          >🚀 Soumettre</button>
        )}

        {isRejected && (
          <button
            onClick={() => onSubmit(article.id)}
            style={{
              padding: '0.5rem 1rem', background: C.blue, color: '#fff',
              border: 'none', borderRadius: 7, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
            }}
          >🔄 Re-soumettre</button>
        )}

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            style={{
              padding: '0.5rem 1rem', background: '#fff', color: '#DC2626',
              border: '1px solid #fca5a5', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto',
            }}
          >🗑 Supprimer</button>
        ) : (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600 }}>Confirmer ?</span>
            <button
              onClick={() => { onDelete(article.id); setConfirming(false); }}
              style={{ padding: '0.4rem 0.8rem', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >Oui</button>
            <button
              onClick={() => setConfirming(false)}
              style={{ padding: '0.4rem 0.8rem', background: '#fff', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' }}
            >Non</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════ MAIN PAGE ══════════════════════════════════════ */
type Tab = 'all' | 'draft' | 'pending' | 'published' | 'rejected';

export default function MesArticlesPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<MyArticle[]>([]);
  const [stats,    setStats]    = useState<BlogStats>({});
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<Tab>('all');
  const [toast,    setToast]    = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /* ── auth guard ── */
  useEffect(() => {
    if (!getToken()) { router.push('/connexion'); return; }
    Promise.all([
      authGet<MyArticle[] | { articles: MyArticle[] }>('/portal/blog/me/articles'),
      authGet<BlogStats>('/portal/blog/me/stats').catch(() => ({} as BlogStats)),
    ]).then(([artData, statsData]) => {
      const list = Array.isArray(artData) ? artData : ((artData as any).articles ?? []);
      setArticles(list);
      setStats(statsData);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  /* ── filter ── */
  function filterArticles(t: Tab): MyArticle[] {
    switch (t) {
      case 'draft':     return articles.filter(a => a.status === 'DRAFT');
      case 'pending':   return articles.filter(a => a.status === 'PENDING_REVIEW' || a.moderationStatus === 'PENDING');
      case 'published': return articles.filter(a => a.status === 'PUBLISHED');
      case 'rejected':  return articles.filter(a => a.status === 'REJECTED' || a.moderationStatus === 'REJECTED');
      default:          return articles;
    }
  }

  /* ── delete ── */
  async function handleDelete(id: string) {
    try {
      await authPost(`/portal/blog/${id}/delete`, {});
      setArticles(prev => prev.filter(a => a.id !== id));
      setToast({ message: 'Article supprimé.', type: 'success' });
    } catch {
      setToast({ message: 'Erreur lors de la suppression.', type: 'error' });
    }
  }

  /* ── submit ── */
  async function handleSubmit(id: string) {
    try {
      await authPost(`/portal/blog/${id}/submit`, {});
      setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'PENDING_REVIEW', moderationStatus: 'PENDING' } : a));
      setToast({ message: 'Article soumis à la rédaction !', type: 'success' });
    } catch (e: any) {
      setToast({ message: e.message ?? 'Erreur lors de la soumission.', type: 'error' });
    }
  }

  const counts = {
    all:       articles.length,
    draft:     articles.filter(a => a.status === 'DRAFT').length,
    pending:   articles.filter(a => a.status === 'PENDING_REVIEW' || a.moderationStatus === 'PENDING').length,
    published: articles.filter(a => a.status === 'PUBLISHED').length,
    rejected:  articles.filter(a => a.status === 'REJECTED' || a.moderationStatus === 'REJECTED').length,
  };
  const filtered = filterArticles(tab);

  return (
    <>
      <Nav />
      <main style={{ background: C.bg, minHeight: '100vh' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                <Link href="/blog" style={{ color: C.blue, fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 500 }}>← Blog</Link>
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.navy, margin: 0 }}>📂 Mes articles</h1>
            </div>
            <Link href="/blog/ecrire" style={{
              background: C.gold, color: C.navy, fontWeight: 700, fontSize: '0.875rem',
              padding: '0.625rem 1.25rem', borderRadius: 8, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>✍️ Nouvel article</Link>
          </div>

          {/* ── Stats cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
            <StatCard
              icon="📄"
              label="Articles publiés"
              value={stats.totalPublished ?? counts.published}
            />
            <StatCard
              icon="👁"
              label="Total vues"
              value={(stats.totalViews ?? 0).toLocaleString('fr-FR')}
            />
            <StatCard
              icon="📿"
              label="ZAHAB gagné"
              value={`${(stats.totalZahab ?? 0).toFixed(1)} Z`}
              sub="Via publications & lectures"
            />
            <StatCard
              icon="✓"
              label="Lectures rémunérées"
              value={(stats.totalReadRewarded ?? 0).toLocaleString('fr-FR')}
              sub={`+${((stats.totalReadRewarded ?? 0) * 0.5).toFixed(1)} Z distribués`}
            />
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <Tab label="Tous"         active={tab === 'all'}       count={counts.all}       onClick={() => setTab('all')} />
            <Tab label="Brouillons"   active={tab === 'draft'}     count={counts.draft}     onClick={() => setTab('draft')} />
            <Tab label="En révision"  active={tab === 'pending'}   count={counts.pending}   onClick={() => setTab('pending')} />
            <Tab label="Publiés"      active={tab === 'published'} count={counts.published} onClick={() => setTab('published')} />
            <Tab label="Refusés"      active={tab === 'rejected'}  count={counts.rejected}  onClick={() => setTab('rejected')} />
          </div>

          {/* ── Liste articles ── */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: C.muted }}>Chargement…</div>
          ) : filtered.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {tab === 'draft' ? '📝' : tab === 'published' ? '🎉' : tab === 'pending' ? '⏳' : tab === 'rejected' ? '❌' : '📂'}
              </div>
              <p style={{ color: C.muted, marginBottom: '1.25rem' }}>
                {tab === 'all'       ? "Vous n'avez pas encore d'articles." :
                 tab === 'draft'     ? 'Aucun brouillon en cours.' :
                 tab === 'pending'   ? 'Aucun article en cours de révision.' :
                 tab === 'published' ? 'Aucun article publié.' :
                 'Aucun article refusé.'}
              </p>
              <Link href="/blog/ecrire" style={{
                display: 'inline-block', background: C.gold, color: C.navy,
                fontWeight: 700, fontSize: '0.875rem', padding: '0.625rem 1.5rem',
                borderRadius: 8, textDecoration: 'none',
              }}>✍️ Écrire votre premier article</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map(a => (
                <ArticleCard key={a.id} article={a} onDelete={handleDelete} onSubmit={handleSubmit} />
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? C.green : '#DC2626',
          color: '#fff', fontWeight: 700, fontSize: '0.9rem',
          padding: '0.75rem 1.5rem', borderRadius: 10, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
          onClick={() => setToast(null)}
        >{toast.message}</div>
      )}

      <Footer />
    </>
  );
}
