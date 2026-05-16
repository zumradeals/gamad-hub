'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { authGet, authPost, getToken } from '../../../lib/api';

const C = {
  gold: '#E5C100', blue: '#1696D2', green: '#0E9F4B',
  navy: '#071326', muted: '#6B7280', border: '#E5E7EB', bg: '#f0f2f5',
};

interface Author {
  profile?: { firstName: string; lastName: string };
  displayName?: string;
}
interface Article {
  id: string; slug: string; title: string; excerpt?: string; content: string;
  category?: { id: string; name: string };
  author?: Author;
  createdAt: string; updatedAt: string;
  viewCount?: number; readingTimeMin?: number;
  tags?: string[];
  sponsored?: boolean;
}

function displayName(a?: Author): string {
  if (!a) return 'Auteur inconnu';
  const p = a.profile;
  if (p?.firstName) return `${p.firstName} ${p.lastName ?? ''}`.trim();
  return a.displayName ?? 'Auteur';
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ReviewModal({
  article, onClose, onDone,
}: {
  article: Article;
  onClose: () => void;
  onDone: (id: string, action: 'approve' | 'reject') => void;
}) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const rt = article.readingTimeMin ?? Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200));

  async function submit(action: 'approve' | 'reject') {
    if (action === 'reject' && !note.trim()) { setError('Une note de refus est obligatoire.'); return; }
    setError('');
    setLoading(true);
    try {
      await authPost(`/portal/blog/redaction/${article.id}/review`, { action, note: note.trim() || undefined });
      onDone(article.id, action);
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de la revue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,19,38,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Header modal */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.2rem' }}>Revue éditoriale</div>
            <h2 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: C.navy }}>
              {article.title}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: C.muted, cursor: 'pointer', padding: '0.25rem' }}>✕</button>
        </div>

        {/* Contenu article */}
        <div style={{ padding: '1.5rem', flex: 1, overflow: 'auto' }}>
          {/* Meta */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: C.muted, marginBottom: '1.25rem', padding: '0.75rem 1rem', background: C.bg, borderRadius: 8 }}>
            <span>✍️ {displayName(article.author)}</span>
            {article.category && <span>📂 {article.category.name}</span>}
            <span>⏱ {rt} min de lecture</span>
            <span>📅 {formatDate(article.createdAt)}</span>
            {article.sponsored && <span style={{ color: C.gold, fontWeight: 700 }}>⭐ SPONSORISÉ</span>}
          </div>

          {/* Extrait */}
          {article.excerpt && (
            <div style={{ padding: '0.875rem 1rem', background: '#fffbeb', borderLeft: `3px solid ${C.gold}`, borderRadius: '0 8px 8px 0', marginBottom: '1.25rem', fontSize: '0.9375rem', color: '#92400e', fontStyle: 'italic', lineHeight: 1.6 }}>
              {article.excerpt}
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {article.tags.map(t => (
                <span key={t} style={{ background: C.bg, color: C.muted, fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: 4 }}>#{t}</span>
              ))}
            </div>
          )}

          {/* Contenu */}
          <div style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#1a1a2e', whiteSpace: 'pre-wrap', maxHeight: 320, overflow: 'auto', background: C.bg, borderRadius: 8, padding: '1rem' }}>
            {article.content}
          </div>

          {/* Note de refus */}
          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: C.navy, marginBottom: '0.5rem' }}>
              Note éditoriale (obligatoire en cas de refus)
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Expliquez pourquoi l'article est refusé ou quelles modifications sont attendues…"
              rows={3}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 8,
                border: `1px solid ${C.border}`, fontSize: '0.875rem', lineHeight: 1.6,
                outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{ marginTop: '0.75rem', padding: '0.625rem 0.875rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', fontSize: '0.8125rem' }}>
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${C.border}`, display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: '#fff', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0.625rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
            Annuler
          </button>
          <button
            onClick={() => submit('reject')}
            disabled={loading}
            style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.625rem 1.25rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '…' : '✗ Refuser'}
          </button>
          <button
            onClick={() => submit('approve')}
            disabled={loading}
            style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '0.625rem 1.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '…' : '✓ Publier l\'article'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RedactionPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [selected, setSelected] = useState<Article | null>(null);

  const fetchQueue = useCallback(() => {
    setLoading(true);
    authGet<Article[]>('/portal/blog/redaction/queue')
      .then(setArticles)
      .catch((e: any) => {
        if (e.message?.includes('403') || e.message?.includes('éditeurs')) setAccessDenied(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!getToken()) { router.push('/connexion'); return; }
    fetchQueue();
  }, [router, fetchQueue]);

  function handleDone(id: string, action: 'approve' | 'reject') {
    setSelected(null);
    setArticles(prev => prev.filter(a => a.id !== id));
  }

  if (accessDenied) {
    return (
      <>
        <Nav />
        <main style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
          <div style={{ fontSize: '3rem' }}>🔒</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.navy, textAlign: 'center' }}>Accès réservé aux éditeurs</h1>
          <p style={{ color: C.muted, textAlign: 'center', maxWidth: 400 }}>
            La salle de rédaction est réservée aux membres ayant le rôle Éditeur. Contactez l'administration pour obtenir cet accès.
          </p>
          <Link href="/blog" style={{ color: C.blue, fontWeight: 600, textDecoration: 'none' }}>← Retour au blog</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main style={{ background: C.bg, minHeight: '100vh' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.25rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.8125rem', color: C.muted, marginBottom: '0.25rem' }}>
              <Link href="/blog" style={{ color: C.blue, textDecoration: 'none' }}>Blog</Link> › Salle de rédaction
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.navy, margin: '0 0 0.25rem' }}>Salle de rédaction</h1>
                <p style={{ margin: 0, fontSize: '0.875rem', color: C.muted }}>Articles en attente de validation éditoriale</p>
              </div>
              <div style={{ background: articles.length > 0 ? '#fee2e2' : '#d1fae5', color: articles.length > 0 ? '#991b1b' : '#065f46', borderRadius: 20, padding: '0.375rem 0.875rem', fontWeight: 700, fontSize: '0.875rem' }}>
                {articles.length} article{articles.length !== 1 ? 's' : ''} en attente
              </div>
            </div>
          </div>

          {/* File d'attente */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: C.muted }}>Chargement de la file d'attente…</div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: C.muted }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <p style={{ fontWeight: 600, color: C.navy, marginBottom: '0.5rem' }}>File d'attente vide</p>
              <p style={{ fontSize: '0.875rem' }}>Tous les articles ont été traités.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {articles.map(a => {
                const rt = a.readingTimeMin ?? Math.max(1, Math.ceil(a.content.split(/\s+/).length / 200));
                return (
                  <div
                    key={a.id}
                    style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                    onClick={() => setSelected(a)}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ background: '#FEF3C7', color: '#92400e', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 4 }}>En attente</span>
                        {a.category && (
                          <span style={{ background: '#EBF5FB', color: C.blue, fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 4 }}>{a.category.name}</span>
                        )}
                        {a.sponsored && (
                          <span style={{ background: C.gold, color: C.navy, fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: 4 }}>SPONSORISÉ</span>
                        )}
                        <span style={{ color: C.muted, fontSize: '0.75rem', marginLeft: 'auto' }}>{formatDate(a.createdAt)}</span>
                      </div>
                      <h3 style={{ margin: '0 0 0.375rem', fontSize: '1rem', fontWeight: 700, color: C.navy, lineHeight: 1.35 }}>
                        {a.title}
                      </h3>
                      {a.excerpt && (
                        <p style={{ margin: '0 0 0.625rem', fontSize: '0.8125rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.excerpt}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: C.muted, flexWrap: 'wrap' }}>
                        <span>✍️ {displayName(a.author)}</span>
                        <span>⏱ {rt} min</span>
                        <span>{a.content.split(/\s+/).length} mots</span>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setSelected(a); }}
                      style={{
                        background: C.navy, color: '#fff', border: 'none', borderRadius: 8,
                        padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', flexShrink: 0,
                      }}
                    >
                      Réviser →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {selected && (
        <ReviewModal
          article={selected}
          onClose={() => setSelected(null)}
          onDone={handleDone}
        />
      )}

      <Footer />
    </>
  );
}
