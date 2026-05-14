import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { publicGet } from '../lib/api';

async function getData() {
  const [articles, videos, formations] = await Promise.all([
    publicGet<any[]>('/public/articles?take=3').catch(() => []),
    publicGet<any[]>('/public/videos?take=3').catch(() => []),
    publicGet<any[]>('/public/formations?take=3').catch(() => []),
  ]);
  return { articles, videos, formations };
}

const SERVICES = [
  { name: 'G-SEARCH', desc: 'Moteur de recherche universel', status: 'Disponible' },
  { name: 'GAMAD Blog', desc: 'Articles et analyses', status: 'Disponible' },
  { name: 'GAMAD TV', desc: 'Contenus vidéo', status: 'Disponible' },
  { name: 'Formations', desc: 'Parcours certifiants', status: 'Disponible' },
  { name: 'Bibliothèque', desc: 'Ressources documentaires', status: 'Disponible' },
  { name: 'Marketplace', desc: 'Échange de services', status: 'Bientôt' },
  { name: 'Wallet', desc: 'Paiements et transactions', status: 'En développement' },
  { name: 'GAMAD Santé', desc: 'Services de santé', status: 'En développement' },
];

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  'Disponible':      { color: 'var(--teal)',   bg: 'var(--teal-light)',  border: '#0f6e5630' },
  'Bientôt':         { color: 'var(--amber)',  bg: 'var(--amber-light)', border: '#854f0b30' },
  'En développement':{ color: '#5a5a5a',       bg: '#f0eeea',            border: '#e5e2dc' },
};

export default async function HomePage() {
  const { articles, videos, formations } = await getData();

  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '5rem 2rem 4rem',
          textAlign: 'center',
          background: 'var(--bg)',
        }}>
          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '1rem',
            maxWidth: 700,
          }}>
            Connaissances,<br />formations et ressources.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2.5rem', maxWidth: 520 }}>
            Explorez des milliers de ressources, articles et formations
            accessibles à tous.
          </p>

          {/* G-SEARCH bar */}
          <form action="/recherche" method="get" style={{
            display: 'flex',
            width: '100%',
            maxWidth: 640,
            background: 'var(--bg-card)',
            border: '1.5px solid var(--text)',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', color: 'var(--text-muted)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              name="q"
              type="search"
              placeholder="Rechercher articles, formations, ressources..."
              style={{
                flex: 1,
                padding: '1rem 0.5rem',
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                background: 'transparent',
                color: 'var(--text)',
              }}
            />
            <button type="submit" style={{
              padding: '0.875rem 1.75rem',
              background: 'var(--teal)',
              color: '#fff',
              border: 'none',
              fontSize: '0.9375rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>
              Rechercher
            </button>
          </form>

          {/* Pills */}
          <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'Tout', type: 'all' },
              { label: 'Articles', type: 'articles' },
              { label: 'Vidéos', type: 'videos' },
              { label: 'Formations', type: 'formations' },
              { label: 'Ressources', type: 'resources' },
            ].map(p => (
              <Link key={p.type} href={`/recherche?type=${p.type}`} style={{
                padding: '0.3125rem 0.875rem',
                border: '1px solid var(--border)',
                borderRadius: 20,
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-card)',
              }}>
                {p.label}
              </Link>
            ))}
          </div>
        </section>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          {/* Articles */}
          <Section title="Derniers articles" href="/blog">
            {articles.length === 0
              ? <EmptyState>Aucun article disponible</EmptyState>
              : <CardGrid>{articles.map((a: any) => (
                  <ArticleCard key={a.id} article={a} />
                ))}</CardGrid>
            }
          </Section>

          {/* TV */}
          <Section title="GAMAD TV" href="/tv">
            {videos.length === 0
              ? <EmptyState>Aucune vidéo disponible</EmptyState>
              : <CardGrid>{videos.map((v: any) => (
                  <VideoCard key={v.id} video={v} />
                ))}</CardGrid>
            }
          </Section>

          {/* Formations */}
          <Section title="Formations disponibles" href="/formations">
            {formations.length === 0
              ? <EmptyState>Aucune formation disponible</EmptyState>
              : <CardGrid>{formations.map((f: any) => (
                  <FormationCard key={f.id} formation={f} />
                ))}</CardGrid>
            }
          </Section>

          {/* Services */}
          <section style={{ marginBottom: '4rem' }}>
            <SectionHeader title="Services de l'écosystème" />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1rem',
            }}>
              {SERVICES.map(s => {
                const st = STATUS_STYLE[s.status];
                return (
                  <div key={s.name} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '1.25rem',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 4 }}>{s.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: 12 }}>{s.desc}</div>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 4,
                      color: st.color,
                      background: st.bg,
                      border: `1px solid ${st.border}`,
                    }}>
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '4rem' }}>
      <SectionHeader title={title} href={href} />
      {children}
    </section>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)' }}>{title}</h2>
      {href && (
        <Link href={href} style={{ fontSize: '0.875rem', color: 'var(--teal)', fontWeight: 500 }}>
          Voir tout →
        </Link>
      )}
    </div>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
      {children}
    </div>
  );
}

function ArticleCard({ article }: { article: any }) {
  return (
    <Link href={`/blog/${article.slug}`} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.15s',
    }}>
      {article.imageUrl && (
        <div style={{ height: 160, background: '#e5e2dc', overflow: 'hidden' }}>
          <img src={article.imageUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '1.25rem', flex: 1 }}>
        {article.category && (
          <span style={{ fontSize: '0.6875rem', color: 'var(--teal)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {article.category.name}
          </span>
        )}
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0.375rem 0 0.5rem', color: 'var(--text)' }}>
          {article.title}
        </h3>
        {article.excerpt && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            {article.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}

function VideoCard({ video }: { video: any }) {
  return (
    <Link href={`/tv/${video.slug}`} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        height: 160,
        background: '#1a1a1a',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {video.thumbnailUrl
          ? <img src={video.thumbnailUrl} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
          : <span style={{ color: '#fff', fontSize: '2rem' }}>▶</span>
        }
        {video.duration && (
          <span style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            fontSize: '0.75rem',
            padding: '2px 6px',
            borderRadius: 3,
          }}>
            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
          </span>
        )}
      </div>
      <div style={{ padding: '1rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{video.title}</h3>
        {video.category && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{video.category.name}</span>
        )}
      </div>
    </Link>
  );
}

function FormationCard({ formation }: { formation: any }) {
  return (
    <Link href={`/formations/${formation.slug}`} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '1.375rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>{formation.title}</h3>
      {formation.description && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
          {formation.description.slice(0, 100)}{formation.description.length > 100 ? '…' : ''}
        </p>
      )}
      {formation._count?.modules !== undefined && (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 'auto' }}>
          {formation._count.modules} module{formation._count.modules !== 1 ? 's' : ''}
        </span>
      )}
    </Link>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>{children}</p>;
}
