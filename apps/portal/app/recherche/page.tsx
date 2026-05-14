'use client';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const TYPES = [
  { key: 'all',        label: 'Tout' },
  { key: 'articles',   label: 'Articles' },
  { key: 'videos',     label: 'Vidéos' },
  { key: 'formations', label: 'Formations' },
  { key: 'resources',  label: 'Ressources' },
];

const TYPE_LABEL: Record<string, string> = {
  articles: 'Article', videos: 'Vidéo', formations: 'Formation', resources: 'Ressource',
};

function RechercheContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [type, setType] = useState(params.get('type') ?? 'all');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q: string, t: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${BASE}/public/search?q=${encodeURIComponent(q)}&type=${t}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = params.get('q') ?? '';
    const t = params.get('type') ?? 'all';
    setQuery(q);
    setType(t);
    if (q) search(q, t);
  }, [params, search]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/recherche?q=${encodeURIComponent(query)}&type=${type}`);
  }

  const allItems: { item: any; kind: string }[] = results
    ? [
        ...(results.articles ?? []).map((i: any) => ({ item: i, kind: 'articles' })),
        ...(results.videos ?? []).map((i: any) => ({ item: i, kind: 'videos' })),
        ...(results.formations ?? []).map((i: any) => ({ item: i, kind: 'formations' })),
        ...(results.resources ?? []).map((i: any) => ({ item: i, kind: 'resources' })),
      ]
    : [];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 2rem' }}>
      {/* Search bar */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        background: 'var(--bg-card)',
        border: '1.5px solid var(--text)',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: '1.25rem',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', color: 'var(--text-muted)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          type="search"
          placeholder="Rechercher…"
          style={{ flex: 1, padding: '0.875rem 0.5rem', border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', color: 'var(--text)' }}
        />
        <button type="submit" style={{
          padding: '0.875rem 1.5rem',
          background: 'var(--teal)',
          color: '#fff',
          border: 'none',
          fontSize: '0.9375rem',
          fontWeight: 500,
        }}>
          Rechercher
        </button>
      </form>

      {/* Type filters */}
      <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => {
              setType(t.key);
              if (query) router.push(`/recherche?q=${encodeURIComponent(query)}&type=${t.key}`);
            }}
            style={{
              padding: '0.375rem 0.875rem',
              border: '1px solid var(--border)',
              borderRadius: 20,
              fontSize: '0.8125rem',
              background: type === t.key ? 'var(--text)' : 'var(--bg-card)',
              color: type === t.key ? 'var(--bg)' : 'var(--text-secondary)',
              fontWeight: type === t.key ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Recherche en cours…</div>
      )}

      {!loading && searched && allItems.length === 0 && (
        <div style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>○</div>
          <p style={{ fontWeight: 500 }}>Aucun résultat pour « {query} »</p>
          <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Essayez d'autres mots-clés ou changez de filtre.</p>
        </div>
      )}

      {!loading && !searched && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          Entrez un terme de recherche pour afficher les résultats.
        </p>
      )}

      {!loading && allItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 4 }}>
            {allItems.length} résultat{allItems.length > 1 ? 's' : ''}
          </p>
          {allItems.map(({ item, kind }, i) => {
            const href = kind === 'articles' ? `/blog/${item.slug}`
              : kind === 'videos' ? `/tv/${item.slug}`
              : kind === 'formations' ? `/formations/${item.slug}`
              : `/ressources`;
            return (
              <Link key={i} href={href} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                transition: 'border-color 0.12s',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 3 }}>{item.title}</div>
                  {(item.excerpt ?? item.description) && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      {(item.excerpt ?? item.description ?? '').slice(0, 120)}…
                    </div>
                  )}
                </div>
                <span style={{
                  flexShrink: 0,
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  background: 'var(--teal-light)',
                  color: 'var(--teal)',
                  border: '1px solid #0f6e5620',
                }}>
                  {TYPE_LABEL[kind]}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RecherchePage() {
  return (
    <>
      <Nav />
      <main style={{ minHeight: '80vh' }}>
        <Suspense fallback={
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 2rem', color: 'var(--text-muted)' }}>
            Chargement…
          </div>
        }>
          <RechercheContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
