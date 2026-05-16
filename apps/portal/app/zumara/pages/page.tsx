'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { publicGet, getToken } from '../../../lib/api';

interface PageSummary {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  logoUrl?: string;
  coverUrl?: string;
  category?: string;
  country?: string;
  city?: string;
  followCount: number;
  _count: { posts: number; products: number; followers: number };
  cell: { name: string; slug: string };
}

const CATEGORIES = [
  { value: '', label: 'Toutes' },
  { value: 'tech', label: 'Tech' },
  { value: 'education', label: 'Éducation' },
  { value: 'culture', label: 'Culture' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'sante', label: 'Santé' },
  { value: 'media', label: 'Média' },
  { value: 'art', label: 'Art' },
];

export default function PagesProPage() {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!getToken();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(currentPage) });
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    publicGet<{ pages: PageSummary[]; total: number; pages_count: number }>(
      `/portal/pages?${params}`,
    ).then((data) => {
      setPages(data.pages);
      setTotal(data.total);
      setPagesCount(data.pages_count);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentPage, category, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleCategory = (val: string) => {
    setCategory(val);
    setCurrentPage(1);
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 700, color: '#071326', margin: 0 }}>
              Pages Pro
            </h1>
            <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>
              {total} page{total !== 1 ? 's' : ''} — marques et services de la communauté GAMAD
            </p>
          </div>
          {isLoggedIn && (
            <Link href="/zumara/pages/creer" style={{
              background: '#E5C100', color: '#071326', padding: '10px 20px',
              borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none',
              display: 'inline-block',
            }}>
              + Créer une Page
            </Link>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher une Page Pro..."
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB',
              fontSize: 14, background: '#fff', outline: 'none',
            }}
          />
          <button type="submit" style={{
            background: '#1696D2', color: '#fff', border: 'none', padding: '10px 18px',
            borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>
            Chercher
          </button>
        </form>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => handleCategory(c.value)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                border: category === c.value ? '2px solid #E5C100' : '1px solid #E5E7EB',
                background: category === c.value ? '#FFF8DC' : '#fff',
                color: category === c.value ? '#071326' : '#6B7280',
                fontWeight: category === c.value ? 700 : 400,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>Chargement…</div>
        ) : pages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
            <p style={{ color: '#6B7280', fontSize: 15 }}>Aucune Page Pro trouvée</p>
            {isLoggedIn && (
              <Link href="/zumara/pages/creer" style={{
                color: '#E5C100', fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}>
                Créer la première →
              </Link>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {pages.map((p) => (
              <PageCard key={p.id} page={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagesCount > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {Array.from({ length: pagesCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: 'none',
                  background: n === currentPage ? '#E5C100' : '#fff',
                  color: n === currentPage ? '#071326' : '#6B7280',
                  fontWeight: 700, cursor: 'pointer', fontSize: 14,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PageCard({ page }: { page: PageSummary }) {
  return (
    <Link href={`/zumara/pages/${page.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff', borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        }}
      >
        {/* Cover */}
        <div style={{
          height: 100,
          background: page.coverUrl
            ? `url(${page.coverUrl}) center/cover`
            : 'linear-gradient(135deg, #071326 0%, #1696D2 100%)',
        }} />

        {/* Logo + info */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: -28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 12,
              background: page.logoUrl ? `url(${page.logoUrl}) center/cover` : '#E5C100',
              border: '3px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>
              {!page.logoUrl && '🏪'}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
              <div style={{
                fontWeight: 700, fontSize: 15, color: '#071326',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {page.name}
              </div>
              {page.category && (
                <span style={{
                  fontSize: 11, background: '#F3F4F6', color: '#6B7280',
                  padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {page.category}
                </span>
              )}
            </div>
          </div>

          {page.tagline && (
            <p style={{
              fontSize: 13, color: '#6B7280', margin: '10px 0 0',
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {page.tagline}
            </p>
          )}

          <div style={{
            display: 'flex', gap: 16, marginTop: 12,
            fontSize: 12, color: '#6B7280',
          }}>
            <span>👥 {page.followCount.toLocaleString()} abonné{page.followCount !== 1 ? 's' : ''}</span>
            <span>📝 {page._count.posts} publications</span>
            <span>🛍️ {page._count.products} produits</span>
          </div>

          {(page.city || page.country) && (
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
              📍 {[page.city, page.country].filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
