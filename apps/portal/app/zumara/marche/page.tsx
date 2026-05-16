'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { publicGet, authPost, getToken, getUser } from '../../../lib/api';

/* ─── Types ─── */
interface PageSummary {
  name: string; slug: string; logoUrl?: string; category?: string;
  country?: string; city?: string;
  cell?: { id: string };
  _count?: { followers: number; products: number };
  followCount?: number;
  tagline?: string;
}

interface MarketProduct {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency: string;
  type: 'PRODUCT' | 'SERVICE';
  available: boolean;
  createdAt: string;
  page: PageSummary;
}

interface MarketOrder {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  paymentMethod: 'ZAHAB' | 'WAVE' | 'ORANGE_MONEY';
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentRef?: string;
  createdAt: string;
  product: { id: string; name: string; imageUrl?: string; type: string; page: { name: string; slug: string } };
}

interface PortalUser { gamadId: string; publicCode: string; displayName?: string; }

type ModalState =
  | { type: 'none' }
  | { type: 'product'; product: MarketProduct }
  | { type: 'order-confirm'; product: MarketProduct; paymentMethod: 'ZAHAB' | 'WAVE' | 'ORANGE_MONEY' }
  | { type: 'order-success'; order: MarketOrder; instructions?: string; reference?: string }
  | { type: 'my-orders' };

const CATEGORIES = ['tech', 'education', 'culture', 'commerce', 'sante', 'media', 'art'];
const COUNTRIES = ['Cameroun', 'Sénégal', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso', 'France'];
const TYPE_LABEL = { PRODUCT: 'Produit', SERVICE: 'Service' };
const PAYMENT_ICONS: Record<string, string> = { ZAHAB: '⚡', WAVE: '🌊', ORANGE_MONEY: '🟠' };
const PAYMENT_LABELS: Record<string, string> = { ZAHAB: 'ZAHAB (instant)', WAVE: 'Wave Mobile', ORANGE_MONEY: 'Orange Money' };

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente de paiement',
  CONFIRMED: 'Confirmée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: '#E5C100', CONFIRMED: '#0E9F4B', SHIPPED: '#1696D2',
  DELIVERED: '#0E9F4B', CANCELLED: '#EF4444',
};

/* ─── Main ─── */
export default function MarchePage() {
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });

  // Filters
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const isLoggedIn = !!getToken();
  const me = getUser<PortalUser>();

  const loadProducts = useCallback(async (pg = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pg) });
    if (category) params.set('category', category);
    if (country) params.set('country', country);
    if (type) params.set('type', type);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (search) params.set('search', search);
    try {
      const data = await publicGet<{ products: MarketProduct[]; total: number; pages: number }>(
        `/portal/market?${params}`,
      );
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
      setCurrentPage(pg);
    } finally {
      setLoading(false);
    }
  }, [category, country, type, minPrice, maxPrice, search]);

  useEffect(() => { loadProducts(1); }, [loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const resetFilters = () => {
    setCategory(''); setCountry(''); setType('');
    setMinPrice(''); setMaxPrice('');
    setSearch(''); setSearchInput('');
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '240px 1fr 280px',
        gap: 16, alignItems: 'start',
      }}>

        {/* ── LEFT: Filters ── */}
        <aside style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: '#071326', borderRadius: 12, padding: '16px', marginBottom: 12, color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#E5C100', letterSpacing: '0.06em' }}>MARCHÉ</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>GAMAD — Produits & Services</div>
          </div>

          <form onSubmit={handleSearch} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher…"
                style={{
                  flex: 1, padding: '8px 10px', borderRadius: 8,
                  border: '1px solid #E5E7EB', fontSize: 13, outline: 'none',
                }}
              />
              <button type="submit" style={{
                background: '#1696D2', color: '#fff', border: 'none',
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              }}>🔍</button>
            </div>
          </form>

          <FilterSection title="Type">
            <FilterPill label="Tous" active={!type} onClick={() => setType('')} />
            <FilterPill label="Produits" active={type === 'PRODUCT'} onClick={() => setType('PRODUCT')} />
            <FilterPill label="Services" active={type === 'SERVICE'} onClick={() => setType('SERVICE')} />
          </FilterSection>

          <FilterSection title="Catégorie">
            <FilterPill label="Toutes" active={!category} onClick={() => setCategory('')} />
            {CATEGORIES.map((c) => (
              <FilterPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
            ))}
          </FilterSection>

          <FilterSection title="Pays">
            <FilterPill label="Tous" active={!country} onClick={() => setCountry('')} />
            {COUNTRIES.map((c) => (
              <FilterPill key={c} label={c} active={country === c} onClick={() => setCountry(c)} />
            ))}
          </FilterSection>

          <FilterSection title="Prix (ZAHAB)">
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min" type="number"
                style={{ width: '50%', padding: '6px 8px', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 12, outline: 'none' }}
              />
              <input
                value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max" type="number"
                style={{ width: '50%', padding: '6px 8px', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 12, outline: 'none' }}
              />
            </div>
          </FilterSection>

          {(category || country || type || minPrice || maxPrice || search) && (
            <button
              onClick={resetFilters}
              style={{
                width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #E5E7EB',
                background: '#fff', color: '#6B7280', fontSize: 13, cursor: 'pointer', marginTop: 4,
              }}
            >
              ✕ Réinitialiser les filtres
            </button>
          )}

          {isLoggedIn && (
            <button
              onClick={() => setModal({ type: 'my-orders' })}
              style={{
                width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                background: '#071326', color: '#E5C100', fontWeight: 700,
                fontSize: 13, cursor: 'pointer', marginTop: 12,
              }}
            >
              📦 Mes commandes
            </button>
          )}
        </aside>

        {/* ── CENTER: Product grid ── */}
        <main style={{ minWidth: 0 }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: '14px 20px',
            marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <span style={{ fontSize: 14, color: '#6B7280' }}>
              {loading ? 'Chargement…' : `${total} article${total !== 1 ? 's' : ''} disponible${total !== 1 ? 's' : ''}`}
            </span>
            <Link href="/zumara/pages" style={{ fontSize: 13, color: '#1696D2', textDecoration: 'none' }}>
              Voir les Pages Pro →
            </Link>
          </div>

          {loading ? (
            <div style={{ background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center', color: '#6B7280' }}>
              Chargement du marché…
            </div>
          ) : products.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
              <p style={{ color: '#6B7280', fontSize: 15 }}>Aucun produit ne correspond à vos critères</p>
              <button onClick={resetFilters} style={{
                background: '#E5C100', color: '#071326', border: 'none',
                padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: 12,
              }}>
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 14,
              }}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onOpen={() => setModal({ type: 'product', product: p })} />
                ))}
              </div>

              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => loadProducts(n)}
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
            </>
          )}
        </main>

        {/* ── RIGHT: Info panel ── */}
        <aside style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#071326', margin: '0 0 12px' }}>Paiements acceptés</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span style={{ fontSize: 18 }}>{PAYMENT_ICONS[key]}</span>
                  <span style={{ color: '#374151' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#071326', margin: '0 0 10px' }}>Comment vendre ?</h3>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: '0 0 12px' }}>
              Créez une Page Pro depuis votre Zumara ESTABLISHED pour publier vos produits et services.
            </p>
            <Link href="/zumara/pages" style={{
              display: 'block', textAlign: 'center', background: '#E5C100',
              color: '#071326', padding: '9px', borderRadius: 8,
              fontWeight: 700, fontSize: 13, textDecoration: 'none',
            }}>
              Voir les Pages Pro
            </Link>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#071326', margin: '0 0 10px' }}>Qu'est-ce que ZAHAB ?</h3>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: '0 0 8px' }}>
              ZAHAB est la monnaie officielle de GAMAD. Gagnez-en en participant à la communauté.
            </p>
            <Link href="/dashboard/wallet" style={{ fontSize: 13, color: '#1696D2', textDecoration: 'none' }}>
              Mon wallet ZAHAB →
            </Link>
          </div>
        </aside>
      </div>

      {/* ── Modals ── */}
      {modal.type !== 'none' && (
        <Overlay onClose={() => setModal({ type: 'none' })}>
          {modal.type === 'product' && (
            <ProductModal
              product={modal.product}
              isLoggedIn={isLoggedIn}
              onOrder={(method) => setModal({ type: 'order-confirm', product: modal.product, paymentMethod: method })}
              onClose={() => setModal({ type: 'none' })}
            />
          )}
          {modal.type === 'order-confirm' && (
            <OrderConfirmModal
              product={modal.product}
              paymentMethod={modal.paymentMethod}
              onConfirm={async (dto) => {
                const res = await authPost<{ order: MarketOrder; instructions?: string; reference?: string }>(
                  `/portal/market/${modal.product.id}/order`,
                  dto,
                );
                setModal({
                  type: 'order-success',
                  order: res.order,
                  instructions: res.instructions,
                  reference: res.reference,
                });
              }}
              onBack={() => setModal({ type: 'product', product: modal.product })}
            />
          )}
          {modal.type === 'order-success' && (
            <OrderSuccessModal
              order={modal.order}
              instructions={modal.instructions}
              reference={modal.reference}
              onClose={() => setModal({ type: 'none' })}
            />
          )}
          {modal.type === 'my-orders' && (
            <MyOrdersModal onClose={() => setModal({ type: 'none' })} />
          )}
        </Overlay>
      )}
    </div>
  );
}

/* ─── Filter helpers ─── */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', marginBottom: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
        border: active ? '2px solid #E5C100' : '1px solid #E5E7EB',
        background: active ? '#FFF8DC' : 'transparent',
        color: active ? '#071326' : '#6B7280',
        fontWeight: active ? 700 : 400,
      }}
    >
      {label}
    </button>
  );
}

/* ─── Product card ─── */
function ProductCard({ product, onOpen }: { product: MarketProduct; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      style={{
        background: '#fff', borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
      }}
    >
      {/* Image */}
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
      ) : (
        <div style={{
          height: 80, background: 'linear-gradient(135deg, #f0f2f5, #e5e7eb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>
          {product.type === 'SERVICE' ? '⚙️' : '📦'}
        </div>
      )}

      <div style={{ padding: '12px' }}>
        {/* Type badge */}
        <span style={{
          fontSize: 10, padding: '2px 7px', borderRadius: 10, marginBottom: 6, display: 'inline-block',
          background: product.type === 'SERVICE' ? '#EFF6FF' : '#F0FDF4',
          color: product.type === 'SERVICE' ? '#1696D2' : '#0E9F4B',
        }}>
          {TYPE_LABEL[product.type]}
        </span>

        <div style={{ fontWeight: 700, fontSize: 14, color: '#071326', marginBottom: 4, lineHeight: 1.3 }}>
          {product.name}
        </div>

        {/* Seller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
          {product.page.logoUrl ? (
            <img src={product.page.logoUrl} alt="" style={{ width: 16, height: 16, borderRadius: 4, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 16, height: 16, borderRadius: 4, background: '#E5C100', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏪</div>
          )}
          <span style={{ fontSize: 12, color: '#6B7280' }}>{product.page.name}</span>
        </div>

        {/* Price */}
        {product.price != null ? (
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 15, color: '#0E9F4B' }}>
            {product.price.toLocaleString('fr-FR')} {product.currency}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>Prix sur demande</div>
        )}
      </div>
    </div>
  );
}

/* ─── Overlay ─── */
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, maxWidth: 560, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Product Modal ─── */
function ProductModal({
  product, isLoggedIn, onOrder, onClose,
}: {
  product: MarketProduct; isLoggedIn: boolean;
  onOrder: (method: 'ZAHAB' | 'WAVE' | 'ORANGE_MONEY') => void;
  onClose: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<'ZAHAB' | 'WAVE' | 'ORANGE_MONEY'>('ZAHAB');

  return (
    <div>
      {/* Image */}
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: '16px 16px 0 0' }} />
      ) : (
        <div style={{
          height: 120, background: 'linear-gradient(135deg, #071326, #1696D2)',
          borderRadius: '16px 16px 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48,
        }}>
          {product.type === 'SERVICE' ? '⚙️' : '📦'}
        </div>
      )}

      <div style={{ padding: '20px 24px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: '#071326', margin: 0, flex: 1 }}>{product.name}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280', padding: 0, marginLeft: 8 }}>✕</button>
        </div>

        <span style={{
          fontSize: 11, padding: '3px 10px', borderRadius: 12, display: 'inline-block', marginBottom: 12,
          background: product.type === 'SERVICE' ? '#EFF6FF' : '#F0FDF4',
          color: product.type === 'SERVICE' ? '#1696D2' : '#0E9F4B',
        }}>
          {TYPE_LABEL[product.type]}
        </span>

        {/* Seller */}
        <Link href={`/zumara/pages/${product.page.slug}`} style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            background: '#F9FAFB', borderRadius: 10, marginBottom: 14, border: '1px solid #E5E7EB',
          }}>
            {product.page.logoUrl ? (
              <img src={product.page.logoUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E5C100', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏪</div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#071326' }}>{product.page.name}</div>
              {product.page.category && (
                <div style={{ fontSize: 12, color: '#6B7280' }}>{product.page.category}</div>
              )}
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#1696D2' }}>Voir la page →</span>
          </div>
        </Link>

        {/* Description */}
        {product.description && (
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
            {product.description}
          </p>
        )}

        {/* Location */}
        {(product.page.city || product.page.country) && (
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
            📍 {[product.page.city, product.page.country].filter(Boolean).join(', ')}
          </div>
        )}

        {/* Price + order */}
        {product.price != null ? (
          <>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 26, fontWeight: 800, color: '#0E9F4B', marginBottom: 16,
            }}>
              {product.price.toLocaleString('fr-FR')} {product.currency}
            </div>

            {isLoggedIn ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Moyen de paiement</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['ZAHAB', 'WAVE', 'ORANGE_MONEY'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        style={{
                          flex: 1, padding: '10px 8px', borderRadius: 8, cursor: 'pointer',
                          border: paymentMethod === m ? '2px solid #E5C100' : '1px solid #E5E7EB',
                          background: paymentMethod === m ? '#FFF8DC' : '#fff',
                          fontSize: 12, fontWeight: paymentMethod === m ? 700 : 400,
                          color: '#071326',
                        }}
                      >
                        <div style={{ fontSize: 18, marginBottom: 2 }}>{PAYMENT_ICONS[m]}</div>
                        {PAYMENT_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onOrder(paymentMethod)}
                  style={{
                    width: '100%', padding: '14px', background: '#E5C100',
                    color: '#071326', border: 'none', borderRadius: 10,
                    fontWeight: 800, fontSize: 16, cursor: 'pointer',
                  }}
                >
                  Commander — {product.price.toLocaleString('fr-FR')} {product.currency}
                </button>
              </>
            ) : (
              <Link href="/connexion" style={{
                display: 'block', textAlign: 'center', background: '#E5C100',
                color: '#071326', padding: '14px', borderRadius: 10,
                fontWeight: 800, fontSize: 15, textDecoration: 'none',
              }}>
                Connexion pour commander
              </Link>
            )}
          </>
        ) : (
          <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '16px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
            Prix sur demande — contactez la page directement.
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Order Confirm Modal ─── */
function OrderConfirmModal({
  product, paymentMethod, onConfirm, onBack,
}: {
  product: MarketProduct;
  paymentMethod: 'ZAHAB' | 'WAVE' | 'ORANGE_MONEY';
  onConfirm: (dto: { quantity: number; paymentMethod: string; note?: string }) => Promise<void>;
  onBack: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = (product.price ?? 0) * quantity;

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm({ quantity, paymentMethod, note: note || undefined });
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la commande');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px 28px 24px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#1696D2', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20 }}>
        ← Retour
      </button>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#071326', margin: '0 0 20px' }}>Confirmer la commande</h2>

      {/* Product summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, padding: '14px', background: '#F9FAFB', borderRadius: 10 }}>
        {product.imageUrl && (
          <img src={product.imageUrl} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#071326' }}>{product.name}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>{product.page.name}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 14, color: '#0E9F4B', marginTop: 2 }}>
            {(product.price ?? 0).toLocaleString('fr-FR')} {product.currency}
          </div>
        </div>
      </div>

      {/* Quantity */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Quantité</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 16, cursor: 'pointer' }}>−</button>
          <span style={{ fontWeight: 700, fontSize: 16, minWidth: 24, textAlign: 'center' }}>{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 16, cursor: 'pointer' }}>+</button>
        </div>
      </div>

      {/* Note */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Note (optionnel)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Instructions spéciales, adresse de livraison…"
          rows={2}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Payment */}
      <div style={{ padding: '14px', background: '#F9FAFB', borderRadius: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
          <span>Méthode</span>
          <span>{PAYMENT_ICONS[paymentMethod]} {PAYMENT_LABELS[paymentMethod]}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17 }}>
          <span style={{ color: '#071326' }}>Total</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#0E9F4B' }}>
            {total.toLocaleString('fr-FR')} {product.currency}
          </span>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: '#B91C1C', fontSize: 13 }}>
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        style={{
          width: '100%', padding: '14px', background: loading ? '#D1D5DB' : '#E5C100',
          color: '#071326', border: 'none', borderRadius: 10,
          fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Traitement…' : `Confirmer — ${total.toLocaleString('fr-FR')} ${product.currency}`}
      </button>
    </div>
  );
}

/* ─── Order Success Modal ─── */
function OrderSuccessModal({
  order, instructions, reference, onClose,
}: {
  order: MarketOrder; instructions?: string; reference?: string; onClose: () => void;
}) {
  return (
    <div style={{ padding: '32px 28px', textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>
        {order.status === 'CONFIRMED' ? '✅' : '⏳'}
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#071326', margin: '0 0 8px' }}>
        {order.status === 'CONFIRMED' ? 'Commande confirmée !' : 'Commande enregistrée !'}
      </h2>
      <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 20px' }}>
        {order.status === 'CONFIRMED'
          ? 'Le vendeur a été notifié. Votre ZAHAB a été transféré.'
          : 'Complétez le paiement pour valider votre commande.'}
      </p>

      {reference && (
        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Référence de paiement</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 16, color: '#071326' }}>{reference}</div>
        </div>
      )}

      {instructions && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '14px', marginBottom: 20, textAlign: 'left' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E', marginBottom: 4 }}>Instructions de paiement</div>
          <p style={{ fontSize: 13, color: '#78350F', margin: 0, lineHeight: 1.6 }}>{instructions}</p>
        </div>
      )}

      <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>{order.product.name}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span style={{ color: '#071326' }}>{order.quantity} × {order.unitPrice.toLocaleString('fr-FR')} {order.currency}</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#0E9F4B' }}>{order.totalPrice.toLocaleString('fr-FR')} {order.currency}</span>
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          width: '100%', padding: '13px', background: '#071326',
          color: '#E5C100', border: 'none', borderRadius: 10,
          fontWeight: 700, fontSize: 15, cursor: 'pointer',
        }}
      >
        Fermer
      </button>
    </div>
  );
}

/* ─── My Orders Modal ─── */
function MyOrdersModal({ onClose }: { onClose: () => void }) {
  const [orders, setOrders] = useState<MarketOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicGet<MarketOrder[]>('/portal/market/my-orders')
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#071326', margin: 0 }}>📦 Mes commandes</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280' }}>✕</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Chargement…</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
          <p style={{ color: '#6B7280' }}>Aucune commande passée</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map((o) => (
            <div key={o.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#071326' }}>{o.product.name}</div>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: `${STATUS_COLOR[o.status]}20`,
                  color: STATUS_COLOR[o.status], fontWeight: 700,
                }}>
                  {STATUS_LABEL[o.status]}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
                {o.product.page.name} · {new Date(o.createdAt).toLocaleDateString('fr-FR')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  {PAYMENT_ICONS[o.paymentMethod]} {PAYMENT_LABELS[o.paymentMethod]} · {o.quantity}×
                </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 14, color: '#0E9F4B' }}>
                  {o.totalPrice.toLocaleString('fr-FR')} {o.currency}
                </span>
              </div>
              {o.paymentRef && (
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Réf: {o.paymentRef}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
