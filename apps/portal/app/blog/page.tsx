'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { publicGet, getToken } from '../../lib/api';

const C = {
  gold:   '#E5C100',
  blue:   '#1696D2',
  green:  '#0E9F4B',
  navy:   '#071326',
  muted:  '#6B7280',
  border: '#E5E7EB',
  bg:     '#f0f2f5',
};

interface Category       { id: string; name: string; color?: string }
interface Author         { profile?: { firstName: string; lastName: string; avatarUrl?: string }; displayName?: string }
interface Article {
  id: string; slug: string; title: string; excerpt?: string;
  imageUrl?: string; videoUrl?: string; sponsored?: boolean;
  category?: Category; author?: Author;
  publishedAt?: string; viewCount?: number; likesCount?: number;
  readingTime?: number; content?: string;
}
interface TrendingArticle { id: string; slug: string; title: string; viewCount?: number }

/* ── helpers ── */
function initials(a?: Author): string {
  if (!a) return 'G';
  const p = a.profile;
  if (p?.firstName && p?.lastName) return (p.firstName[0] + p.lastName[0]).toUpperCase();
  if (a.displayName) return a.displayName.slice(0, 2).toUpperCase();
  return 'G';
}
function displayName(a?: Author): string {
  if (!a) return 'GAMAD';
  const p = a.profile;
  if (p?.firstName) return `${p.firstName} ${p.lastName ?? ''}`.trim();
  return a.displayName ?? 'Auteur';
}
function readTime(article: Article): number {
  if (article.readingTime) return article.readingTime;
  return Math.max(1, Math.ceil((article.content ?? '').split(/\s+/).length / 200));
}
function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
function avatarColor(name: string): string {
  const palette = [C.navy, C.blue, C.green, '#7C3AED', '#DB2777', '#EA580C'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

/* ── sub-components ── */
function CategoryBadge({ cat }: { cat?: Category }) {
  if (!cat) return null;
  return (
    <span style={{
      display: 'inline-block', fontSize: '0.6875rem', fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase' as const,
      background: '#EBF5FB', color: C.blue,
      padding: '0.2rem 0.5rem', borderRadius: 4,
    }}>{cat.name}</span>
  );
}

function Avatar({ author, size = 28 }: { author?: Author; size?: number }) {
  const dn = displayName(author);
  const ini = initials(author);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: avatarColor(dn),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3 + 'px', fontWeight: 700, color: '#fff', flexShrink: 0,
    }}>{ini}</div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const rt  = readTime(article);
  const dn  = displayName(article.author);
  const bg  = `linear-gradient(135deg, ${C.navy} 0%, #1a2a4a 100%)`;

  return (
    <Link href={`/blog/${article.slug}`} style={{ textDecoration: 'none', display: 'flex' }}>
      <div
        style={{
          background: '#fff', borderRadius: 12, overflow: 'hidden',
          border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column',
          width: '100%', transition: 'box-shadow 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
      >
        {/* Cover */}
        <div style={{ height: 160, background: article.imageUrl ? undefined : bg, position: 'relative', flexShrink: 0 }}>
          {article.imageUrl
            ? <img src={article.imageUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2.25rem' }}>📄</div>
          }
          {/* badges overlay top-left */}
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {article.sponsored && (
              <span style={{ background: C.gold, color: C.navy, fontSize: '0.6rem', fontWeight: 800, padding: '0.2rem 0.45rem', borderRadius: 4, letterSpacing: '0.05em' }}>SPONSORISÉ</span>
            )}
            {article.videoUrl && (
              <span style={{ background: C.blue, color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.45rem', borderRadius: 4 }}>▶ Vidéo</span>
            )}
          </div>
          {/* ZAHAB badge bottom-right */}
          <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
            <span style={{ background: 'rgba(14,159,75,0.9)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.45rem', borderRadius: 4 }}>📿 +0.5 Z</span>
          </div>
        </div>

        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <CategoryBadge cat={article.category} />
          <h2 style={{
            fontSize: '0.9375rem', fontWeight: 700, color: C.navy, lineHeight: 1.4, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
          }}>{article.title}</h2>
          {article.excerpt && (
            <p style={{
              color: C.muted, fontSize: '0.8125rem', lineHeight: 1.55, margin: 0,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
            }}>{article.excerpt}</p>
          )}
          {/* Author row */}
          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Avatar author={article.author} size={26} />
            <span style={{ fontSize: '0.75rem', color: C.navy, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dn}</span>
          </div>
          {/* Meta */}
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: C.muted, flexWrap: 'wrap' }}>
            <span>⏱ {rt} min</span>
            {(article.viewCount ?? 0) > 0 && <span>👁 {article.viewCount!.toLocaleString('fr-FR')}</span>}
            {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeaturedCard({ article }: { article: Article }) {
  const rt = readTime(article);
  const dn = displayName(article.author);
  return (
    <Link href={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
      <div
        style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}`, marginBottom: '1.5rem', transition: 'box-shadow 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
      >
        {/* Cover */}
        <div style={{ height: 300, position: 'relative', background: article.imageUrl ? undefined : `linear-gradient(135deg, ${C.navy} 0%, #1a2a4a 100%)` }}>
          {article.imageUrl
            ? <img src={article.imageUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>📰</div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,19,38,0.72) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
            <span style={{ background: C.gold, color: C.navy, fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: 4, letterSpacing: '0.04em' }}>À LA UNE</span>
            {article.sponsored && <span style={{ background: C.gold, color: C.navy, fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: 4 }}>SPONSORISÉ</span>}
            {article.videoUrl && <span style={{ background: C.blue, color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: 4 }}>▶ Vidéo</span>}
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <CategoryBadge cat={article.category} />
          <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.875rem)', fontWeight: 800, color: C.navy, lineHeight: 1.3, margin: '0.75rem 0 0.5rem' }}>
            {article.title}
          </h1>
          {article.excerpt && (
            <p style={{ color: C.muted, fontSize: '0.9375rem', lineHeight: 1.6, margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {article.excerpt}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Avatar author={article.author} size={32} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: C.navy }}>{dn}</span>
            </div>
            <span style={{ fontSize: '0.8125rem', color: C.muted }}>⏱ {rt} min de lecture</span>
            {(article.viewCount ?? 0) > 0 && <span style={{ fontSize: '0.8125rem', color: C.muted }}>👁 {article.viewCount!.toLocaleString('fr-FR')}</span>}
            {article.publishedAt && <span style={{ fontSize: '0.8125rem', color: C.muted }}>{formatDate(article.publishedAt)}</span>}
            <span style={{ background: 'rgba(14,159,75,0.1)', color: C.green, fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 4, marginLeft: 'auto' }}>📿 +0.5 Z à la lecture</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── main page ── */
export default function BlogPage() {
  const [articles,    setArticles]    = useState<Article[]>([]);
  const [trending,   setTrending]    = useState<TrendingArticle[]>([]);
  const [categories, setCategories]  = useState<Category[]>([]);
  const [loading,    setLoading]     = useState(true);
  const [page,       setPage]        = useState(1);
  const [hasMore,    setHasMore]     = useState(true);
  const [category,   setCategory]    = useState('');
  const [sort,       setSort]        = useState<'recent' | 'popular'>('recent');
  const [search,     setSearch]      = useState('');
  const [searchInput,setSearchInput] = useState('');
  const [isLoggedIn, setIsLoggedIn]  = useState(false);

  useEffect(() => { setIsLoggedIn(!!getToken()); }, []);

  const fetchArticles = useCallback(async (p = 1, cat = category, s = sort, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), sort: s });
      if (cat) params.set('category', cat);
      if (q)   params.set('search', q);
      const data = await publicGet<Article[] | { articles: Article[]; total: number }>(`/portal/blog?${params}`);
      const list = Array.isArray(data) ? data : ((data as any).articles ?? []);
      if (p === 1) setArticles(list);
      else setArticles(prev => [...prev, ...list]);
      setHasMore(list.length >= 10);
    } catch { /* silent */ }
    setLoading(false);
  }, [category, sort, search]);

  useEffect(() => {
    publicGet<Category[]>('/portal/blog/categories').then(setCategories).catch(() => {});
    publicGet<TrendingArticle[]>('/portal/blog/trending').then(setTrending).catch(() => {});
  }, []);

  useEffect(() => { setPage(1); fetchArticles(1, category, sort, search); }, [category, sort, search]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    fetchArticles(next);
  }

  const featured = articles[0];
  const rest     = articles.slice(1);

  return (
    <>
      <Nav />
      <main style={{ background: C.bg, minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 260px', gap: '1.5rem', alignItems: 'start' }}>

            {/* ═══ COLONNE GAUCHE ═══ */}
            <aside style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Brand block */}
              <div style={{ background: C.navy, borderRadius: 12, padding: '1.25rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.14em', color: C.gold, marginBottom: '0.2rem' }}>GAMAD</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: C.gold, letterSpacing: '0.1em' }}>BLOG</div>
                <div style={{ width: 32, height: 2, background: C.gold, margin: '0.5rem auto 0', borderRadius: 2 }} />
              </div>

              {/* Bouton écrire — connecté seulement */}
              {isLoggedIn && (
                <Link href="/blog/ecrire" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  background: C.gold, color: C.navy, fontWeight: 700, fontSize: '0.8125rem',
                  padding: '0.625rem 1rem', borderRadius: 8, textDecoration: 'none', letterSpacing: '0.02em',
                }}>✍️ Écrire</Link>
              )}

              {/* Filtres catégorie */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '1rem', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '0.75rem' }}>Catégories</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {[{ id: '', name: 'Toutes' }, ...categories].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      style={{
                        background: category === cat.id ? C.gold : 'transparent',
                        color: category === cat.id ? C.navy : C.muted,
                        border: 'none', borderRadius: 6, padding: '0.375rem 0.625rem',
                        fontSize: '0.8125rem', fontWeight: category === cat.id ? 700 : 500,
                        cursor: 'pointer', textAlign: 'left' as const, transition: 'all 0.15s',
                      }}
                    >{cat.name}</button>
                  ))}
                </div>
              </div>

              {/* Liens rapides */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '1rem', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '0.75rem' }}>Navigation</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link href="/blog/mes-articles" style={{ color: C.blue, fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none' }}>📂 Mes articles</Link>
                  <Link href="/blog/redaction"   style={{ color: C.blue, fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none' }}>🖊 Salle de rédaction</Link>
                </div>
              </div>
            </aside>

            {/* ═══ CENTRE ═══ */}
            <div>
              {/* Barre recherche + sort */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '0.5rem', minWidth: 0 }}>
                  <input
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Rechercher un article…"
                    style={{
                      flex: 1, padding: '0.625rem 1rem', borderRadius: 8,
                      border: `1px solid ${C.border}`, background: '#fff',
                      fontSize: '0.875rem', outline: 'none', minWidth: 0,
                    }}
                  />
                  <button type="submit" style={{
                    background: C.blue, color: '#fff', border: 'none', borderRadius: 8,
                    padding: '0.625rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem',
                  }}>Chercher</button>
                </form>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {(['recent', 'popular'] as const).map(s => (
                    <button key={s} onClick={() => setSort(s)} style={{
                      padding: '0.5rem 0.875rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                      border: `1px solid ${sort === s ? C.navy : C.border}`,
                      background: sort === s ? C.navy : '#fff',
                      color: sort === s ? '#fff' : C.muted, cursor: 'pointer',
                    }}>{s === 'recent' ? '🕐 Récents' : '🔥 Populaires'}</button>
                  ))}
                </div>
              </div>

              {/* Article vedette */}
              {!loading && featured && <FeaturedCard article={featured} />}

              {/* Grille 2 colonnes */}
              {loading && articles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: C.muted }}>Chargement…</div>
              ) : !featured && rest.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: C.muted }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                  <p style={{ marginBottom: '1rem' }}>Aucun article pour le moment.</p>
                  {isLoggedIn && <Link href="/blog/ecrire" style={{ color: C.gold, fontWeight: 700 }}>Soyez le premier à écrire</Link>}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {rest.map(a => <ArticleCard key={a.id} article={a} />)}
                </div>
              )}

              {/* Pagination */}
              {hasMore && !loading && articles.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button
                    onClick={handleLoadMore}
                    style={{
                      background: '#fff', color: C.navy, border: `1px solid ${C.border}`,
                      borderRadius: 8, padding: '0.75rem 2.5rem', cursor: 'pointer',
                      fontSize: '0.875rem', fontWeight: 600,
                    }}
                  >Voir plus d'articles</button>
                </div>
              )}
              {loading && articles.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: C.muted, fontSize: '0.875rem' }}>Chargement…</div>
              )}
            </div>

            {/* ═══ COLONNE DROITE ═══ */}
            <aside style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Tendances */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '1rem' }}>🔥 Tendances</div>
                {trending.length === 0
                  ? <p style={{ color: C.muted, fontSize: '0.8125rem', margin: 0 }}>Aucune tendance disponible</p>
                  : trending.slice(0, 5).map((a, i) => (
                    <Link key={a.id} href={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.625rem 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: i === 0 ? C.gold : C.border, minWidth: 24, lineHeight: 1 }}>{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: C.navy, lineHeight: 1.35 }}>{a.title}</p>
                          {(a.viewCount ?? 0) > 0 && <span style={{ fontSize: '0.7rem', color: C.muted }}>👁 {a.viewCount!.toLocaleString('fr-FR')} vues</span>}
                        </div>
                      </div>
                    </Link>
                  ))
                }
              </div>

              {/* ZAHAB info */}
              <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1a2a4a 100%)`, borderRadius: 12, padding: '1.25rem', color: '#fff' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>📿</div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.5rem', color: C.gold }}>Rémunéré pour lire</div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: '#a0b0c8', margin: '0 0 1rem' }}>
                  Chaque article lu vous rapporte <strong style={{ color: C.gold }}>+0.5 Z</strong> en ZAHAB — la monnaie officielle GAMAD.
                </p>
                <div style={{ background: 'rgba(229,193,0,0.15)', border: `1px solid rgba(229,193,0,0.3)`, borderRadius: 8, padding: '0.625rem 0.75rem', fontSize: '0.75rem', color: C.gold }}>
                  💡 ZAHAB sera déployé sur Stellar Network
                </div>
              </div>

              {/* CTA auteur */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>✍️</div>
                <div style={{ fontWeight: 700, color: C.navy, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Devenez auteur</div>
                <p style={{ color: C.muted, fontSize: '0.8rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
                  Partagez vos idées et gagnez <strong>+20 Z</strong> à chaque publication validée.
                </p>
                <Link href="/blog/ecrire" style={{
                  display: 'block', background: C.gold, color: C.navy,
                  fontWeight: 700, fontSize: '0.8125rem', padding: '0.625rem',
                  borderRadius: 8, textDecoration: 'none',
                }}>Écrire un article</Link>
              </div>
            </aside>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
