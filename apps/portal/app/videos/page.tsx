'use client';

import { useEffect, useState, useCallback } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { publicGet, getToken } from '../../lib/api';

interface Video {
  id: string;
  slug: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  durationMin?: number;
  viewCount: number;
  likesCount: number;
  watchRewardCount: number;
  publishedAt?: string;
  category?: { id: string; name: string; slug: string };
  author?: { publicCode: string; profile?: { displayName?: string; avatarUrl?: string } };
  channel?: { id: string; name: string };
}

interface VideoList {
  videos: Video[];
  total: number;
  page: number;
  pages: number;
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function VideoCard({ v }: { v: Video }) {
  const ytId = extractYouTubeId(v.youtubeUrl);
  const thumb = v.thumbnailUrl ?? (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

  return (
    <Link href={`/videos/${v.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div style={{
        background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
        overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#071326', overflow: 'hidden' }}>
          {thumb
            ? <img src={thumb} alt={v.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '2.5rem' }}>▶</span>
              </div>
          }
          {v.durationMin && (
            <span style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(0,0,0,0.8)', color: '#fff',
              fontSize: '0.75rem', padding: '2px 6px', borderRadius: 3,
            }}>
              {v.durationMin} min
            </span>
          )}
        </div>
        <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#071326', marginBottom: 4, lineHeight: 1.35, flex: 1 }}>
            {v.title}
          </h3>
          <div style={{ display: 'flex', gap: '0.875rem', fontSize: '0.75rem', color: '#6B7280', marginTop: 8 }}>
            <span>▶ {v.viewCount.toLocaleString()}</span>
            <span>♥ {v.likesCount}</span>
            {v.category && <span style={{ marginLeft: 'auto' }}>{v.category.name}</span>}
          </div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ background: 'rgba(229,193,0,0.15)', color: '#b8960a', padding: '1px 6px', borderRadius: 4, fontSize: '0.6875rem', fontWeight: 700 }}>
              +0.5 Z regardée
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function VideosPage() {
  const [data, setData] = useState<VideoList | null>(null);
  const [trending, setTrending] = useState<Video[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  const isLoggedIn = !!getToken();

  const fetchVideos = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), sort });
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    publicGet<VideoList>(`/portal/videos?${params}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, category, search, sort]);

  useEffect(() => {
    Promise.all([
      publicGet<Video[]>('/portal/videos/trending').catch(() => []),
      publicGet<any[]>('/portal/videos/categories').catch(() => []),
    ]).then(([t, c]) => { setTrending(t); setCategories(c); });
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: '#f0f2f5' }}>

        {/* Header */}
        <div style={{ background: '#071326', padding: '2.5rem 2rem 3rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: '0.375rem' }}>
              🎬 GamadTube
            </h1>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
              Regardez des vidéos et gagnez du ZAHAB. +0.5Z par vidéo complétée.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.625rem', maxWidth: 480 }}>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Rechercher une vidéo…"
                style={{
                  flex: 1, padding: '0.625rem 1rem', borderRadius: 8, border: 'none',
                  fontSize: '0.9375rem', background: 'rgba(255,255,255,0.1)', color: '#fff',
                  outline: 'none',
                }}
              />
              <button type="submit" style={{
                background: '#E5C100', color: '#071326', border: 'none',
                borderRadius: 8, padding: '0.625rem 1.25rem', fontWeight: 700, cursor: 'pointer',
              }}>
                Rechercher
              </button>
            </form>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem' }}>

          {/* Filters row */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['recent', 'popular'].map(s => (
                <button
                  key={s}
                  onClick={() => { setSort(s as any); setPage(1); }}
                  style={{
                    padding: '0.375rem 0.875rem', borderRadius: 20, border: 'none',
                    fontSize: '0.8125rem', cursor: 'pointer', fontWeight: sort === s ? 700 : 400,
                    background: sort === s ? '#071326' : '#fff',
                    color: sort === s ? '#fff' : '#6B7280',
                  }}
                >
                  {s === 'recent' ? 'Récentes' : 'Populaires'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setCategory(''); setPage(1); }}
                style={{
                  padding: '0.375rem 0.875rem', borderRadius: 20, cursor: 'pointer', fontSize: '0.8125rem',
                  border: `1px solid ${!category ? '#E5C100' : '#E5E7EB'}`,
                  background: !category ? 'rgba(229,193,0,0.1)' : '#fff',
                  color: !category ? '#b8960a' : '#6B7280', fontWeight: !category ? 700 : 400,
                }}
              >Toutes</button>
              {categories.map((c: any) => (
                <button key={c.id} onClick={() => { setCategory(c.slug); setPage(1); }}
                  style={{
                    padding: '0.375rem 0.875rem', borderRadius: 20, cursor: 'pointer', fontSize: '0.8125rem',
                    border: `1px solid ${category === c.slug ? '#E5C100' : '#E5E7EB'}`,
                    background: category === c.slug ? 'rgba(229,193,0,0.1)' : '#fff',
                    color: category === c.slug ? '#b8960a' : '#6B7280',
                    fontWeight: category === c.slug ? 700 : 400,
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {isLoggedIn && (
              <Link href="/videos/publier" style={{ marginLeft: 'auto', textDecoration: 'none' }}>
                <button style={{
                  background: '#E5C100', color: '#071326', border: 'none',
                  borderRadius: 8, padding: '0.5rem 1.125rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                }}>
                  + Publier une vidéo
                </button>
              </Link>
            )}
          </div>

          {/* Trending sidebar layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem', alignItems: 'start' }}>

            {/* Main grid */}
            <div>
              {loading && <p style={{ color: '#6B7280', padding: '2rem 0' }}>Chargement…</p>}
              {!loading && data && data.videos.length === 0 && (
                <p style={{ color: '#6B7280', padding: '2rem 0' }}>Aucune vidéo trouvée.</p>
              )}
              {!loading && data && data.videos.length > 0 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {data.videos.map(v => <VideoCard key={v.id} v={v} />)}
                  </div>

                  {/* Pagination */}
                  {data.pages > 1 && (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                          style={{
                            width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: p === page ? '#071326' : '#fff', color: p === page ? '#fff' : '#6B7280',
                            fontWeight: p === page ? 700 : 400,
                          }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar — Trending */}
            <div>
              <h3 style={{ fontWeight: 700, color: '#071326', marginBottom: '1rem', fontSize: '0.9375rem' }}>
                🔥 Tendances
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {trending.slice(0, 5).map(v => {
                  const ytId = extractYouTubeId(v.youtubeUrl);
                  const thumb = v.thumbnailUrl ?? (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null);
                  return (
                    <Link key={v.id} href={`/videos/${v.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', background: '#fff', borderRadius: 10, padding: '0.625rem', border: '1px solid #E5E7EB' }}>
                        <div style={{ width: 80, height: 54, flexShrink: 0, background: '#071326', borderRadius: 6, overflow: 'hidden' }}>
                          {thumb && <img src={thumb} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#071326', lineHeight: 1.3, marginBottom: 3,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {v.title}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>▶ {v.viewCount.toLocaleString()}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* ZAHAB info */}
              <div style={{ marginTop: '1.5rem', background: 'rgba(229,193,0,0.08)', border: '1px solid rgba(229,193,0,0.3)', borderRadius: 10, padding: '1rem' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#b8960a', marginBottom: 6 }}>
                  💰 Gagnez du ZAHAB
                </p>
                <ul style={{ fontSize: '0.75rem', color: '#71600a', paddingLeft: '1rem', lineHeight: 1.8 }}>
                  <li>+0.5Z par vidéo regardée</li>
                  <li>+0.1Z par like donné</li>
                  <li>+1Z par commentaire</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
