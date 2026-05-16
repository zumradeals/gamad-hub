'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { publicGet, authPost, getToken, getUser } from '../../lib/api';

/* ─── Types ─── */
type Tab = 'feed' | 'groupes' | 'pages' | 'marche' | 'events';
type ZumaraType = 'LOCAL' | 'DIGITAL' | 'HYBRID';

interface FeedPost {
  id: string;
  content: string;
  createdAt: string;
  gamad: { publicCode: string; profile: { displayName: string; avatarUrl?: string } };
  reactions: { emoji: string; gamadId: string }[];
  _count?: { comments: number };
}

interface FeedComment {
  id: string;
  content: string;
  createdAt: string;
  gamad: { publicCode: string; profile: { displayName: string; avatarUrl?: string } };
}

interface ZumaraCell {
  id: string;
  name: string;
  slug: string;
  objective: string;
  type: ZumaraType;
  country: string | null;
  city: string | null;
  status: string;
  memberCount: number;
  cotisationAmount: number | null;
}

interface PortalUser {
  gamadId: string;
  publicCode: string;
  profile?: { displayName: string; avatarUrl?: string; bio?: string };
}

/* ─── Constants ─── */
const REACTIONS = ['👍', '❤️', '🔥', '💡', '✊', '😂'];
const TYPE_LABEL: Record<ZumaraType, string> = { LOCAL: 'Locale', DIGITAL: 'Numérique', HYBRID: 'Hybride' };
const TYPE_COLOR: Record<ZumaraType, string> = { LOCAL: '#0E9F4B', DIGITAL: '#1696D2', HYBRID: '#E5C100' };

const LEFT_NAV = [
  { icon: '🏠', label: 'Fil d\'actualité', tab: 'feed' as Tab },
  { icon: '◎', label: 'Groupes', tab: 'groupes' as Tab },
  { icon: '📄', label: 'Pages', tab: 'pages' as Tab },
  { icon: '🛒', label: 'Marché', tab: 'marche' as Tab },
  { icon: '📅', label: 'Événements', tab: 'events' as Tab },
];

const MOCK_STORIES = [
  { id: '1', name: 'Oumar D.', initials: 'OD', bg: '#1696D2', emoji: '🌍' },
  { id: '2', name: 'Fatoumata K.', initials: 'FK', bg: '#0E9F4B', emoji: '✊' },
  { id: '3', name: 'Ibrahima S.', initials: 'IS', bg: '#E5C100', emoji: '💡' },
  { id: '4', name: 'Aminata B.', initials: 'AB', bg: '#a78bfa', emoji: '❤️' },
  { id: '5', name: 'Moussa C.', initials: 'MC', bg: '#f59e0b', emoji: '🔥' },
];

/* ─── Helpers ─── */
function ago(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'maintenant';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}j`;
  return new Date(date).toLocaleDateString('fr-FR');
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function extractTrending(posts: FeedPost[]): string[] {
  const tags: Record<string, number> = {};
  posts.forEach(p => {
    const matches = p.content.match(/#[\wÀ-ž]+/g) ?? [];
    matches.forEach(t => { tags[t] = (tags[t] ?? 0) + 1; });
  });
  return Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t]) => t);
}

const AVATAR_COLORS = ['#071326', '#1696D2', '#0E9F4B', '#E5C100', '#a78bfa', '#f59e0b'];
function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

/* ─── Main Page ─── */
export default function ZumaraCarrefourPage() {
  const [tab, setTab] = useState<Tab>('feed');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [me, setMe] = useState<PortalUser | null>(null);

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [cells, setCells] = useState<ZumaraCell[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  const [suggestedUsers] = useState<PortalUser[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getToken();
      setIsLoggedIn(!!token);
      if (token) {
        const stored = getUser<PortalUser>();
        if (stored) setMe(stored);
        publicGet<PortalUser>('/portal/auth/me').then(setMe).catch(() => {});
      }
    }
    loadFeed();
    loadGroups();
  }, []);

  async function loadFeed() {
    setFeedLoading(true);
    try {
      const r = await publicGet<{ posts: FeedPost[] } | FeedPost[]>('/portal/feed');
      const list = Array.isArray(r) ? r : (r as any).posts ?? [];
      setPosts(list);
    } catch { /* silent */ }
    finally { setFeedLoading(false); }
  }

  async function loadGroups() {
    setGroupsLoading(true);
    try {
      const data = await publicGet<ZumaraCell[]>('/portal/zumara');
      setCells(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setGroupsLoading(false); }
  }

  async function react(postId: string, emoji: string) {
    if (!isLoggedIn) return;
    try {
      await authPost(`/portal/feed/${postId}/react`, { emoji });
      const r = await publicGet<{ posts: FeedPost[] } | FeedPost[]>('/portal/feed');
      const list = Array.isArray(r) ? r : (r as any).posts ?? [];
      setPosts(list);
    } catch { /* silent */ }
  }

  const trending = extractTrending(posts);
  const activeGroups = cells.filter(c => c.status === 'ACTIVE' || c.memberCount > 0).slice(0, 4);

  return (
    <>
      <Nav />
      <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingTop: '1rem', paddingBottom: '3rem' }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 1rem',
          display: 'grid',
          gridTemplateColumns: '240px 1fr 300px',
          gap: '1rem',
          alignItems: 'start',
        }}>

          {/* ── LEFT SIDEBAR ── */}
          <LeftSidebar tab={tab} setTab={setTab} isLoggedIn={isLoggedIn} me={me} />

          {/* ── CENTER COLUMN ── */}
          <main style={{ minWidth: 0 }}>
            {tab === 'feed' && (
              <FeedTab
                posts={posts}
                feedLoading={feedLoading}
                isLoggedIn={isLoggedIn}
                me={me}
                onReact={react}
                onPosted={async (p) => setPosts(prev => [p, ...prev])}
              />
            )}
            {tab === 'groupes' && (
              <GroupesTab cells={cells} loading={groupsLoading} isLoggedIn={isLoggedIn} />
            )}
            {tab === 'pages' && (
              <PagesTab />
            )}
            {tab === 'marche' && (
              <MarcheTab />
            )}
            {tab === 'events' && (
              <ComingSoon tab={tab} />
            )}
          </main>

          {/* ── RIGHT SIDEBAR ── */}
          <RightSidebar trending={trending} groups={activeGroups} suggested={suggestedUsers} />
        </div>
      </div>
      <Footer />
    </>
  );
}

/* ─── Left Sidebar ─── */
function LeftSidebar({ tab, setTab, isLoggedIn, me }: {
  tab: Tab; setTab: (t: Tab) => void; isLoggedIn: boolean; me: PortalUser | null;
}) {
  return (
    <aside style={{ position: 'sticky', top: 80 }}>
      {/* Brand */}
      <div style={{
        background: '#071326',
        borderRadius: 12,
        padding: '1rem',
        marginBottom: '0.75rem',
        color: 'white',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.08em', color: '#E5C100' }}>
          ZUMARA
        </div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          La place de la Nation
        </div>
      </div>

      {/* User mini-card */}
      {isLoggedIn && me ? (
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '0.875rem',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: avatarColor(me.profile?.displayName ?? me.publicCode),
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
          }}>
            {initials(me.profile?.displayName ?? me.publicCode)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#071326', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {me.profile?.displayName ?? me.publicCode}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>GAMAD ID · {me.publicCode}</div>
          </div>
        </div>
      ) : (
        <Link href="/connexion" style={{
          display: 'block',
          background: 'white',
          borderRadius: 12,
          padding: '0.875rem',
          marginBottom: '0.75rem',
          textAlign: 'center',
          textDecoration: 'none',
          color: '#1696D2',
          fontWeight: 600,
          fontSize: '0.875rem',
          border: '1px solid #e5e7eb',
        }}>
          Se connecter
        </Link>
      )}

      {/* Nav links */}
      <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: '0.75rem' }}>
        {LEFT_NAV.map(n => (
          <button
            key={n.tab}
            onClick={() => setTab(n.tab)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.75rem 1rem',
              background: tab === n.tab ? '#f0f2f5' : 'transparent',
              border: 'none',
              borderLeft: tab === n.tab ? '3px solid #E5C100' : '3px solid transparent',
              cursor: 'pointer',
              color: tab === n.tab ? '#071326' : '#6B7280',
              fontWeight: tab === n.tab ? 700 : 500,
              fontSize: '0.875rem',
              textAlign: 'left',
              transition: 'background 0.1s',
            }}
          >
            <span style={{ fontSize: '1rem' }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      {/* CTA */}
      <Link href="/zumara/creer" style={{
        display: 'block',
        background: '#E5C100',
        color: '#071326',
        borderRadius: 10,
        padding: '0.75rem 1rem',
        fontWeight: 700,
        fontSize: '0.875rem',
        textDecoration: 'none',
        textAlign: 'center',
      }}>
        + Créer un groupe
      </Link>
    </aside>
  );
}

/* ─── Right Sidebar ─── */
function RightSidebar({ trending, groups, suggested }: {
  trending: string[]; groups: ZumaraCell[]; suggested: any[];
}) {
  return (
    <aside style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Trending */}
      {trending.length > 0 && (
        <div style={{ background: 'white', borderRadius: 12, padding: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Tendances
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {trending.map((tag, i) => (
              <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', width: 16, textAlign: 'right' }}>{i + 1}</span>
                <span style={{ color: '#1696D2', fontWeight: 600, fontSize: '0.875rem' }}>{tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active groups */}
      {groups.length > 0 && (
        <div style={{ background: 'white', borderRadius: 12, padding: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Zumara actives
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {groups.map(g => (
              <Link key={g.id} href={`/zumara/${g.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: TYPE_COLOR[g.type] + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0,
                  }}>
                    {g.type === 'LOCAL' ? '📍' : g.type === 'DIGITAL' ? '🌐' : '🔗'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#071326', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>👥 {g.memberCount} membres</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link href="#" onClick={e => e.preventDefault()} style={{
            display: 'block', marginTop: '0.75rem',
            fontSize: '0.8rem', color: '#1696D2', fontWeight: 600, textDecoration: 'none',
          }}>
            Voir tous les groupes →
          </Link>
        </div>
      )}

      {/* Nation info */}
      <div style={{ background: 'white', borderRadius: 12, padding: '1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Nation GAMAD
        </div>
        <p style={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
          Une civilisation numérique en construction. Rejoignez le mouvement, portez la vision.
        </p>
        <Link href="/rejoindre" style={{
          display: 'inline-block', marginTop: '0.75rem',
          background: '#071326', color: 'white',
          borderRadius: 7, padding: '0.45rem 0.875rem',
          fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
        }}>
          Rejoindre le Réseau
        </Link>
      </div>
    </aside>
  );
}

/* ─── Feed Tab ─── */
function FeedTab({ posts, feedLoading, isLoggedIn, me, onReact, onPosted }: {
  posts: FeedPost[];
  feedLoading: boolean;
  isLoggedIn: boolean;
  me: PortalUser | null;
  onReact: (id: string, emoji: string) => void;
  onPosted: (p: FeedPost) => Promise<void>;
}) {
  return (
    <div>
      <Stories me={me} isLoggedIn={isLoggedIn} />
      <Composer me={me} isLoggedIn={isLoggedIn} onPosted={onPosted} />
      {feedLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map(i => <LoadingSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <Empty>Aucune publication pour l'instant. Soyez le premier à prendre la parole.</Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {posts.map(p => (
            <PostCard key={p.id} post={p} isLoggedIn={isLoggedIn} me={me} onReact={onReact} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Stories ─── */
function Stories({ me, isLoggedIn }: { me: PortalUser | null; isLoggedIn: boolean }) {
  const [active, setActive] = useState<typeof MOCK_STORIES[0] | null>(null);

  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: '0.875rem 1rem',
      marginBottom: '0.75rem',
      overflowX: 'auto',
    }}>
      <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'stretch', minWidth: 'max-content' }}>
        {/* Add story */}
        {isLoggedIn && me && (
          <div style={{
            width: 72, flexShrink: 0, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: avatarColor(me.profile?.displayName ?? ''),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', border: '2px dashed #E5C100', position: 'relative',
            }}>
              {initials(me.profile?.displayName ?? me.publicCode)}
              <span style={{
                position: 'absolute', bottom: -2, right: -2,
                background: '#E5C100', color: '#071326',
                width: 18, height: 18, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 900,
              }}>+</span>
            </div>
            <span style={{ fontSize: '0.65rem', color: '#6B7280', textAlign: 'center', lineHeight: 1.2 }}>
              Ma story
            </span>
          </div>
        )}

        {MOCK_STORIES.map(s => (
          <div key={s.id}
            onClick={() => setActive(s)}
            style={{
              width: 72, flexShrink: 0, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem',
              border: '2px solid #E5C100',
              boxShadow: '0 0 0 2px white',
            }}>
              {s.emoji}
            </div>
            <span style={{ fontSize: '0.65rem', color: '#374151', textAlign: 'center', lineHeight: 1.2, fontWeight: 500 }}>
              {s.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Story modal */}
      {active && (
        <div
          onClick={() => setActive(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 340, height: 580, borderRadius: 16, overflow: 'hidden',
              background: active.bg, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}
          >
            <div style={{ fontSize: '5rem' }}>{active.emoji}</div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', marginTop: '1rem' }}>{active.name}</div>
            <button
              onClick={() => setActive(null)}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(255,255,255,0.2)', border: 'none',
                color: 'white', width: 32, height: 32, borderRadius: '50%',
                cursor: 'pointer', fontSize: '1rem', fontWeight: 700,
              }}
            >×</button>
            <div style={{
              position: 'absolute', top: 8, left: 8, right: 40,
              height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', background: 'white', borderRadius: 2,
                animation: 'story-progress 5s linear forwards',
              }} />
            </div>
            <style>{`@keyframes story-progress { from { width: 0% } to { width: 100% } }`}</style>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Composer ─── */
function Composer({ me, isLoggedIn, onPosted }: {
  me: PortalUser | null; isLoggedIn: boolean;
  onPosted: (p: FeedPost) => Promise<void>;
}) {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isLoggedIn) {
    return (
      <div style={{
        background: 'white', borderRadius: 12, padding: '1rem',
        marginBottom: '0.75rem', textAlign: 'center',
      }}>
        <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>
          <Link href="/connexion" style={{ color: '#1696D2', fontWeight: 600 }}>Connectez-vous</Link>
          {' '}ou{' '}
          <Link href="/inscription" style={{ color: '#1696D2', fontWeight: 600 }}>créez un compte</Link>
          {' '}pour publier dans le Zumara.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const post = await authPost<FeedPost>('/portal/feed', { content });
      await onPosted(post);
      setContent('');
      setExpanded(false);
    } catch { /* silent */ }
    finally { setPosting(false); }
  }

  const displayName = me?.profile?.displayName ?? me?.publicCode ?? '';

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: avatarColor(displayName),
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.875rem',
          }}>
            {initials(displayName)}
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
              placeholder={`Partagez quelque chose, ${displayName.split(' ')[0]}…`}
              rows={expanded ? 4 : 1}
              maxLength={1000}
              style={{
                width: '100%', resize: 'none', border: '1px solid #e5e7eb',
                borderRadius: 20, padding: '0.625rem 1rem',
                fontSize: '0.9375rem', color: '#071326',
                background: '#f0f2f5', outline: 'none',
                fontFamily: 'inherit', lineHeight: 1.5,
                transition: 'height 0.15s',
                boxSizing: 'border-box',
              }}
            />
            {expanded && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.625rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {['😊', '📸', '#️⃣'].map(emoji => (
                    <button
                      key={emoji} type="button"
                      onClick={() => {
                        if (emoji === '#️⃣') setContent(c => c + ' #');
                        else setContent(c => c + emoji);
                        textareaRef.current?.focus();
                      }}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontSize: '1.1rem', padding: '0.25rem 0.3rem', borderRadius: 6,
                        color: '#6B7280',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{content.length}/1000</span>
                  <button
                    type="button"
                    onClick={() => { setExpanded(false); setContent(''); }}
                    style={{
                      padding: '0.4rem 0.75rem', background: '#f0f2f5',
                      border: 'none', borderRadius: 8, cursor: 'pointer',
                      fontSize: '0.875rem', color: '#6B7280',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={posting || !content.trim()}
                    style={{
                      padding: '0.4rem 1rem', background: content.trim() ? '#E5C100' : '#e5e7eb',
                      border: 'none', borderRadius: 8, cursor: content.trim() ? 'pointer' : 'default',
                      fontSize: '0.875rem', fontWeight: 700,
                      color: content.trim() ? '#071326' : '#9ca3af',
                    }}
                  >
                    {posting ? 'Publication…' : 'Publier'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ─── Post Card ─── */
function PostCard({ post, isLoggedIn, me, onReact }: {
  post: FeedPost; isLoggedIn: boolean; me: PortalUser | null;
  onReact: (id: string, emoji: string) => void;
}) {
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reactions = post.reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1; return acc;
  }, {});

  const totalReactions = post.reactions.length;
  const displayName = post.gamad?.profile?.displayName ?? 'Citoyen';

  async function loadComments() {
    if (commentsLoaded) { setShowComments(v => !v); return; }
    setShowComments(true);
    try {
      const list = await publicGet<FeedComment[]>(`/portal/feed/${post.id}/comments`);
      setComments(Array.isArray(list) ? list : []);
      setCommentsLoaded(true);
    } catch { /* silent */ }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !isLoggedIn) return;
    setSubmittingComment(true);
    try {
      const c = await authPost<FeedComment>(`/portal/feed/${post.id}/comments`, { content: commentText });
      setComments(prev => [...prev, c]);
      setCommentText('');
    } catch { /* silent */ }
    finally { setSubmittingComment(false); }
  }

  return (
    <div style={{
      background: 'white', borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    }}>
      {/* Header */}
      <div style={{ padding: '1rem 1rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <Link href={`/profil/${post.gamad?.publicCode}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: avatarColor(displayName),
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem',
          }}>
            {initials(displayName)}
          </div>
        </Link>
        <div>
          <Link href={`/profil/${post.gamad?.publicCode}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#071326' }}>{displayName}</div>
          </Link>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{ago(post.createdAt)}</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 1rem 0.75rem', fontSize: '0.9375rem', lineHeight: 1.7, color: '#1f2937', whiteSpace: 'pre-wrap' }}>
        {post.content}
      </div>

      {/* Reaction summary */}
      {totalReactions > 0 && (
        <div style={{ padding: '0 1rem', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {Object.entries(reactions).slice(0, 3).map(([emoji]) => (
              <span key={emoji} style={{ fontSize: '0.875rem' }}>{emoji}</span>
            ))}
            {totalReactions > 0 && (
              <span style={{ fontSize: '0.8rem', color: '#6B7280', marginLeft: 4 }}>{totalReactions}</span>
            )}
          </div>
          {(post._count?.comments ?? 0) > 0 && (
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              {post._count?.comments} commentaire{(post._count?.comments ?? 0) !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1px solid #f3f4f6', margin: '0 1rem' }} />

      {/* Action bar */}
      <div style={{ padding: '0.25rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', position: 'relative' }}>

        {/* React button */}
        <div
          style={{ position: 'relative', flex: 1 }}
          onMouseEnter={() => {
            if (!isLoggedIn) return;
            reactionTimer.current = setTimeout(() => setShowReactions(true), 400);
          }}
          onMouseLeave={() => {
            if (reactionTimer.current) clearTimeout(reactionTimer.current);
            setShowReactions(false);
          }}
        >
          <button
            onClick={() => isLoggedIn && onReact(post.id, '👍')}
            style={{
              width: '100%', padding: '0.5rem', background: 'transparent', border: 'none',
              cursor: isLoggedIn ? 'pointer' : 'default', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
              color: '#6B7280', fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            👍 J'aime
          </button>

          {/* Reaction picker */}
          {showReactions && isLoggedIn && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 0,
              background: 'white', borderRadius: 999, padding: '0.375rem 0.625rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', gap: '0.25rem',
              zIndex: 100, border: '1px solid #f3f4f6',
            }}>
              {REACTIONS.map(em => (
                <button
                  key={em}
                  onClick={() => { onReact(post.id, em); setShowReactions(false); }}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: '1.4rem', padding: '0.2rem',
                    transition: 'transform 0.1s',
                    lineHeight: 1,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.4) translateY(-4px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment button */}
        <button
          onClick={loadComments}
          style={{
            flex: 1, padding: '0.5rem', background: 'transparent', border: 'none',
            cursor: 'pointer', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            color: '#6B7280', fontSize: '0.875rem', fontWeight: 500,
          }}
        >
          💬 Commenter
        </button>

        {/* Share button */}
        <button
          style={{
            flex: 1, padding: '0.5rem', background: 'transparent', border: 'none',
            cursor: 'pointer', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            color: '#6B7280', fontSize: '0.875rem', fontWeight: 500,
          }}
        >
          ↗ Partager
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '0.75rem 1rem' }}>
          {comments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '0.75rem' }}>
              {comments.map(c => {
                const cName = c.gamad?.profile?.displayName ?? 'Citoyen';
                return (
                  <div key={c.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: avatarColor(cName), color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.65rem',
                    }}>
                      {initials(cName)}
                    </div>
                    <div style={{ background: '#f0f2f5', borderRadius: '0 12px 12px 12px', padding: '0.5rem 0.75rem', flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#071326', marginBottom: 2 }}>{cName}</div>
                      <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>{c.content}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {isLoggedIn ? (
            <form onSubmit={submitComment} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: avatarColor(me?.profile?.displayName ?? ''),
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.65rem',
              }}>
                {initials(me?.profile?.displayName ?? me?.publicCode ?? '')}
              </div>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Écrire un commentaire…"
                maxLength={500}
                style={{
                  flex: 1, border: '1px solid #e5e7eb', borderRadius: 20,
                  padding: '0.5rem 1rem', fontSize: '0.875rem',
                  background: '#f0f2f5', outline: 'none', color: '#1f2937',
                }}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                style={{
                  background: commentText.trim() ? '#E5C100' : '#e5e7eb',
                  border: 'none', borderRadius: 8, padding: '0.4rem 0.625rem',
                  cursor: commentText.trim() ? 'pointer' : 'default',
                  fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                  color: commentText.trim() ? '#071326' : '#9ca3af',
                }}
              >
                {submittingComment ? '…' : 'Envoyer'}
              </button>
            </form>
          ) : (
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0, textAlign: 'center' }}>
              <Link href="/connexion" style={{ color: '#1696D2', fontWeight: 600 }}>Connectez-vous</Link> pour commenter
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Groups Tab ─── */
function GroupesTab({ cells, loading, isLoggedIn }: {
  cells: ZumaraCell[]; loading: boolean; isLoggedIn: boolean;
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = cells.filter(c => {
    if (typeFilter && c.type !== typeFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.objective?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div style={{
        background: 'white', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem',
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un groupe…"
          style={{
            flex: 1, minWidth: 180, border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '0.5rem 0.875rem', fontSize: '0.875rem', background: '#f0f2f5', outline: 'none',
          }}
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{
            border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.5rem 0.875rem',
            fontSize: '0.875rem', background: 'white', cursor: 'pointer', color: '#071326',
          }}
        >
          <option value="">Tous les types</option>
          <option value="LOCAL">Locale</option>
          <option value="DIGITAL">Numérique</option>
          <option value="HYBRID">Hybride</option>
        </select>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{filtered.length} groupe{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} height={160} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#6B7280', marginBottom: '1rem' }}>Aucun groupe trouvé.</p>
          <Link href="/zumara/creer" style={{
            display: 'inline-block', background: '#E5C100', color: '#071326',
            borderRadius: 8, padding: '0.6rem 1.25rem', fontWeight: 700,
            textDecoration: 'none', fontSize: '0.875rem',
          }}>
            Créer le premier groupe
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {filtered.map(c => (
            <Link key={c.id} href={`/zumara/${c.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white', borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'transform 0.1s',
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {/* Cover */}
                <div style={{
                  height: 80, background: `linear-gradient(135deg, ${TYPE_COLOR[c.type]}33, ${TYPE_COLOR[c.type]}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                }}>
                  {c.type === 'LOCAL' ? '📍' : c.type === 'DIGITAL' ? '🌐' : '🔗'}
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#071326', marginBottom: 4 }}>{c.name}</div>
                  <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {c.objective}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.625rem' }}>
                    <span style={{
                      background: TYPE_COLOR[c.type] + '18', color: TYPE_COLOR[c.type],
                      borderRadius: 4, padding: '0.1rem 0.45rem', fontSize: '0.7rem', fontWeight: 700,
                    }}>
                      {TYPE_LABEL[c.type]}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>👥 {c.memberCount}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Pages Tab ─── */
function PagesTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        background: 'white', borderRadius: 12, padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 700, color: '#071326', margin: 0 }}>
            Pages Pro
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
            Marques et services de la communauté GAMAD
          </p>
        </div>
        <a
          href="/zumara/pages"
          style={{
            background: '#E5C100', color: '#071326', padding: '10px 20px',
            borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}
        >
          Parcourir les Pages →
        </a>
      </div>
      <div style={{
        background: 'white', borderRadius: 12, padding: '2rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📄</div>
        <h3 style={{ color: '#071326', fontWeight: 700, marginBottom: 8, fontSize: 16 }}>
          Découvrez les Pages Pro
        </h3>
        <p style={{ color: '#6B7280', maxWidth: 400, margin: '0 auto 20px', fontSize: 14 }}>
          Les Pages Pro sont les vitrines des Zumara ESTABLISHED — marques, services, publications et catalogues.
        </p>
        <a
          href="/zumara/pages"
          style={{
            background: '#1696D2', color: '#fff', padding: '12px 28px',
            borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block',
          }}
        >
          Voir toutes les Pages
        </a>
      </div>
    </div>
  );
}

/* ─── Marché Tab ─── */
function MarcheTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        background: 'white', borderRadius: 12, padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 700, color: '#071326', margin: 0 }}>
            Le Marché
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
            Produits et services des Zumara GAMAD — paiement ZAHAB, Wave ou Orange Money
          </p>
        </div>
        <a
          href="/zumara/marche"
          style={{
            background: '#E5C100', color: '#071326', padding: '10px 20px',
            borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}
        >
          Accéder au Marché →
        </a>
      </div>
      <div style={{ background: 'white', borderRadius: 12, padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🛒</div>
        <h3 style={{ color: '#071326', fontWeight: 700, marginBottom: 8, fontSize: 16 }}>
          Achetez et vendez en ZAHAB
        </h3>
        <p style={{ color: '#6B7280', maxWidth: 420, margin: '0 auto 20px', fontSize: 14, lineHeight: 1.7 }}>
          Le Marché GAMAD regroupe les produits et services des Pages Pro. Paiement en ZAHAB (instantané), Wave ou Orange Money.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/zumara/marche"
            style={{
              background: '#1696D2', color: '#fff', padding: '11px 24px',
              borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}
          >
            Parcourir le Marché
          </a>
          <a
            href="/zumara/pages"
            style={{
              background: '#fff', color: '#071326', padding: '11px 24px',
              borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none',
              border: '1px solid #E5E7EB',
            }}
          >
            Pages Pro
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Coming Soon ─── */
function ComingSoon({ tab }: { tab: Tab }) {
  const labels: Record<Tab, string> = {
    feed: 'Fil d\'actualité', groupes: 'Groupes',
    pages: 'Pages', marche: 'Marché', events: 'Événements',
  };
  const icons: Record<Tab, string> = {
    feed: '📰', groupes: '◎', pages: '📄', marche: '🛒', events: '📅',
  };
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '4rem 2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icons[tab]}</div>
      <h2 style={{ color: '#071326', fontWeight: 700, marginBottom: '0.5rem' }}>{labels[tab]}</h2>
      <p style={{ color: '#6B7280', maxWidth: 360, margin: '0 auto' }}>
        Cette section arrive bientôt. La Nation GAMAD est en construction.
      </p>
    </div>
  );
}

/* ─── Utilities ─── */
function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#6B7280', fontSize: '0.9rem' }}>
      {children}
    </div>
  );
}

function LoadingSkeleton({ height = 100 }: { height?: number }) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, height, overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
    </div>
  );
}
