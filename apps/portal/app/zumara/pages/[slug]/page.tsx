'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { publicGet, authPost, getToken, getUser } from '../../../../lib/api';

interface PortalUser { gamadId: string; displayName?: string; publicCode: string; }

interface PageDetail {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  category?: string;
  website?: string;
  email?: string;
  country?: string;
  city?: string;
  followCount: number;
  status: string;
  isFollowing: boolean;
  createdAt: string;
  _count: { posts: number; products: number; followers: number };
  cell: { id: string; name: string; slug: string; status: string };
  posts: PagePost[];
  products: PageProduct[];
}

interface PagePost {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface PageProduct {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  type: 'PRODUCT' | 'SERVICE';
  available: boolean;
  createdAt: string;
}

type Tab = 'publications' | 'catalogue' | 'apropos';

export default function PageProProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('publications');
  const [following, setFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const me = getUser<PortalUser>();
  const isLoggedIn = !!getToken();

  useEffect(() => {
    publicGet<PageDetail>(`/portal/pages/${slug}`)
      .then((data) => {
        setPage(data);
        setFollowing(data.isFollowing);
        setFollowCount(data.followCount);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const toggleFollow = async () => {
    if (!isLoggedIn || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await authPost<{ action: string }>(`/portal/pages/${slug}/follow`, {});
      if (res.action === 'followed') {
        setFollowing(true);
        setFollowCount((n) => n + 1);
      } else {
        setFollowing(false);
        setFollowCount((n) => Math.max(0, n - 1));
      }
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#f0f2f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6B7280', fontSize: 15 }}>Chargement…</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div style={{ background: '#f0f2f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>🔍</div>
        <p style={{ color: '#6B7280' }}>Page introuvable</p>
        <Link href="/zumara/pages" style={{ color: '#1696D2', fontSize: 14 }}>← Pages Pro</Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>

      {/* Cover */}
      <div style={{
        height: 220,
        background: page.coverUrl
          ? `url(${page.coverUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, #071326 0%, #1696D2 60%, #E5C100 100%)',
        position: 'relative',
      }}>
        <Link href="/zumara/pages" style={{
          position: 'absolute', top: 16, left: 16,
          background: 'rgba(255,255,255,0.85)', color: '#071326',
          padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
          textDecoration: 'none',
        }}>
          ← Pages Pro
        </Link>
      </div>

      {/* Profile header */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
        <div style={{
          background: '#fff', borderRadius: '0 0 12px 12px',
          padding: '0 24px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {/* Logo */}
            <div style={{
              width: 90, height: 90, borderRadius: 16,
              background: page.logoUrl ? `url(${page.logoUrl}) center/cover` : '#E5C100',
              border: '4px solid #fff', marginTop: -45,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              {!page.logoUrl && '🏪'}
            </div>

            {/* Info */}
            <div style={{ flex: 1, paddingTop: 12, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 800, color: '#071326', margin: 0 }}>
                  {page.name}
                </h1>
                {page.category && (
                  <span style={{
                    fontSize: 11, background: '#F3F4F6', color: '#6B7280',
                    padding: '3px 10px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    {page.category}
                  </span>
                )}
              </div>
              {page.tagline && (
                <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 8px' }}>{page.tagline}</p>
              )}
              <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#6B7280', flexWrap: 'wrap' }}>
                <span>👥 <strong style={{ color: '#071326' }}>{followCount.toLocaleString()}</strong> abonné{followCount !== 1 ? 's' : ''}</span>
                <span>📝 <strong style={{ color: '#071326' }}>{page._count.posts}</strong> publications</span>
                <span>🛍️ <strong style={{ color: '#071326' }}>{page._count.products}</strong> produits</span>
                {(page.city || page.country) && (
                  <span>📍 {[page.city, page.country].filter(Boolean).join(', ')}</span>
                )}
              </div>
            </div>

            {/* Follow button */}
            {isLoggedIn && (
              <button
                onClick={toggleFollow}
                disabled={followLoading}
                style={{
                  padding: '10px 24px', borderRadius: 8,
                  border: following ? '2px solid #E5C100' : 'none',
                  background: following ? '#fff' : '#E5C100',
                  color: following ? '#E5C100' : '#071326',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  transition: 'all 0.2s', marginBottom: 4,
                }}
              >
                {followLoading ? '…' : following ? '✓ Abonné' : '+ S\'abonner'}
              </button>
            )}
          </div>
        </div>

        {/* Tab nav */}
        <div style={{
          display: 'flex', gap: 4, background: '#fff',
          borderRadius: 10, padding: 4, margin: '16px 0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: 480,
        }}>
          {(['publications', 'catalogue', 'apropos'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '9px 0', border: 'none',
                borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: tab === t ? '#E5C100' : 'transparent',
                color: tab === t ? '#071326' : '#6B7280',
                transition: 'all 0.2s',
              }}
            >
              {t === 'publications' ? '📝 Publications' : t === 'catalogue' ? '🛍️ Catalogue' : 'ℹ️ À propos'}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'publications' && (
          <PublicationsTab slug={slug} initialPosts={page.posts} me={me} />
        )}
        {tab === 'catalogue' && (
          <CatalogueTab products={page.products} />
        )}
        {tab === 'apropos' && (
          <AProposTab page={page} />
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

/* ── Publications Tab ── */

function PublicationsTab({
  slug,
  initialPosts,
  me,
}: {
  slug: string;
  initialPosts: PagePost[];
  me: PortalUser | null;
}) {
  const [posts, setPosts] = useState<PagePost[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialPosts.length);
  const [hasMore, setHasMore] = useState(false);

  const loadMore = async () => {
    const next = page + 1;
    const data = await publicGet<{ posts: PagePost[]; total: number }>(`/portal/pages/${slug}/posts?page=${next}`);
    setPosts((p) => [...p, ...data.posts]);
    setTotal(data.total);
    setHasMore(posts.length + data.posts.length < data.total);
    setPage(next);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6B7280' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            Aucune publication pour l'instant
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
        {hasMore && (
          <button
            onClick={loadMore}
            style={{
              background: '#fff', border: '1px solid #E5E7EB', padding: '12px',
              borderRadius: 8, color: '#1696D2', fontWeight: 600, cursor: 'pointer', fontSize: 14,
            }}
          >
            Voir plus
          </button>
        )}
      </div>

      {/* Sidebar info */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#071326', margin: '0 0 12px' }}>Publications récentes</h3>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          {total} publication{total !== 1 ? 's' : ''} au total
        </p>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: PagePost }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          style={{ width: '100%', borderRadius: 8, marginBottom: 14, maxHeight: 320, objectFit: 'cover' }}
        />
      )}
      <p style={{ fontSize: 15, color: '#071326', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
        {post.content}
      </p>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 10 }}>
        {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </div>
  );
}

/* ── Catalogue Tab ── */

function CatalogueTab({ products }: { products: PageProduct[] }) {
  const available = products.filter((p) => p.available);
  const unavailable = products.filter((p) => !p.available);

  return (
    <div>
      {products.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 12, padding: 60,
          textAlign: 'center', color: '#6B7280', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🛍️</div>
          <p>Aucun produit ou service publié pour l'instant</p>
        </div>
      ) : (
        <>
          {available.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#071326', margin: '0 0 16px' }}>
                Disponibles ({available.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {available.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
          {unavailable.length > 0 && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#9CA3AF', margin: '0 0 16px' }}>
                Non disponibles ({unavailable.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {unavailable.map((p) => <ProductCard key={p.id} product={p} dimmed />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProductCard({ product, dimmed = false }: { product: PageProduct; dimmed?: boolean }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      opacity: dimmed ? 0.6 : 1,
    }}>
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: '100%', height: 160, objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          height: 100, background: '#F9FAFB',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
        }}>
          {product.type === 'SERVICE' ? '⚙️' : '📦'}
        </div>
      )}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#071326' }}>{product.name}</span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 10,
            background: product.type === 'SERVICE' ? '#EFF6FF' : '#F0FDF4',
            color: product.type === 'SERVICE' ? '#1696D2' : '#0E9F4B',
            flexShrink: 0,
          }}>
            {product.type === 'SERVICE' ? 'Service' : 'Produit'}
          </span>
        </div>

        {product.description && (
          <p style={{
            fontSize: 13, color: '#6B7280', margin: '6px 0 10px',
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          }}>
            {product.description}
          </p>
        )}

        {product.price != null && (
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700, fontSize: 16, color: '#0E9F4B',
          }}>
            {product.price.toLocaleString('fr-FR')} {product.currency || 'ZAHAB'}
          </div>
        )}

        {dimmed && (
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>Non disponible actuellement</div>
        )}
      </div>
    </div>
  );
}

/* ── À propos Tab ── */

function AProposTab({ page }: { page: PageDetail }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {page.description && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#071326', margin: '0 0 12px' }}>À propos</h3>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
              {page.description}
            </p>
          </div>
        )}

        {/* Contact info */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#071326', margin: '0 0 16px' }}>Informations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {page.email && (
              <InfoRow icon="📧" label="Email" value={page.email} href={`mailto:${page.email}`} />
            )}
            {page.website && (
              <InfoRow icon="🌐" label="Site web" value={page.website} href={page.website} />
            )}
            {page.category && (
              <InfoRow icon="🏷️" label="Catégorie" value={page.category} />
            )}
            {(page.city || page.country) && (
              <InfoRow icon="📍" label="Localisation" value={[page.city, page.country].filter(Boolean).join(', ')} />
            )}
            <InfoRow icon="📅" label="Créée le" value={new Date(page.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
          </div>
        </div>
      </div>

      {/* Stats sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#071326', margin: '0 0 16px' }}>Statistiques</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <StatRow label="Abonnés" value={page.followCount.toLocaleString()} icon="👥" />
            <StatRow label="Publications" value={String(page._count.posts)} icon="📝" />
            <StatRow label="Produits/Services" value={String(page._count.products)} icon="🛍️" />
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#071326', margin: '0 0 12px' }}>Zumara associée</h3>
          <Link href={`/zumara/${page.cell.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '10px 12px', borderRadius: 8, background: '#F9FAFB',
              border: '1px solid #E5E7EB',
            }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#071326' }}>{page.cell.name}</div>
              <div style={{ fontSize: 12, color: '#1696D2', marginTop: 2 }}>Voir le groupe →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#1696D2', wordBreak: 'break-all' }}>{value}</a>
        ) : (
          <div style={{ fontSize: 14, color: '#374151' }}>{value}</div>
        )}
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#6B7280' }}>{icon} {label}</span>
      <span style={{ fontWeight: 700, fontSize: 15, color: '#071326' }}>{value}</span>
    </div>
  );
}
