import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { publicGet } from '../lib/api';

async function getData() {
  const [articles] = await Promise.all([
    publicGet<{ items: any[] }>('/public/articles?take=3').catch(() => ({ items: [] })),
  ]);
  return { articles: articles.items ?? [] };
}

const PILLARS = [
  {
    icon: '📖',
    title: 'Formation',
    desc: 'Transmission du savoir, parcours structurés, ressources pédagogiques accessibles partout.',
    accent: 'var(--blue)',
  },
  {
    icon: '⚙️',
    title: 'Travail',
    desc: "Projets utiles, collaborations, opportunités professionnelles dans l'écosystème GAMAD.",
    accent: 'var(--green)',
  },
  {
    icon: '🤝',
    title: 'Adoration',
    desc: 'Responsabilité humaine, équilibre, continuité. Une éthique au cœur de chaque action.',
    accent: 'var(--gold)',
  },
];

const SERVICES = [
  { icon: '📰', label: 'Blog', href: '/blog', desc: 'Articles et actualités' },
  { icon: '🌐', label: 'Communauté', href: '/feed', desc: 'Fil social public' },
  { icon: '📚', label: 'Ressources', href: '/ressources', desc: 'Bibliothèque ouverte' },
  { icon: '🎓', label: 'Formation', href: '/services', desc: 'Parcours et certifications' },
  { icon: '💼', label: 'Services', href: '/services', desc: 'Outils et solutions' },
  { icon: '🔭', label: 'Vision', href: '/vision', desc: 'Notre mission' },
];

export default async function HomePage() {
  const { articles } = await getData();

  return (
    <>
      <Nav />
      <main>
        {/* ── Hero ── */}
        <section style={{
          background: `linear-gradient(135deg, var(--navy) 0%, #0d1f36 100%)`,
          color: 'white',
          padding: '6rem 2rem 5rem',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div className="badge badge-gold" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
              Formation — Travail — Adoration
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', color: 'white', marginBottom: '1.25rem', fontWeight: 700 }}>
              Une infrastructure au service<br />
              <span style={{ color: 'var(--gold)' }}>de la transmission humaine</span>
            </h1>
            <p style={{ fontSize: '1.0625rem', color: '#94a3b8', lineHeight: 1.8, marginBottom: '2.5rem' }}>
              GAMAD est un écosystème numérique, social et économique construit pour durer.
              Des outils, des savoirs, une communauté engagée — accessibles à tous.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/rejoindre" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem' }}>
                Rejoindre le Réseau
              </Link>
              <Link href="/inscription" className="btn" style={{
                padding: '0.75rem 1.75rem',
                fontSize: '0.9375rem',
                background: 'transparent',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: 'var(--radius-md)',
              }}>
                Créer un compte
              </Link>
            </div>
          </div>
        </section>

        {/* ── 3 Piliers ── */}
        <section style={{ padding: '5rem 2rem', background: 'white' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Trois piliers fondateurs</h2>
              <p style={{ color: 'var(--muted)', maxWidth: '520px', margin: '0 auto' }}>
                Chaque action dans l'écosystème GAMAD s'inscrit dans l'une de ces trois dimensions.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {PILLARS.map(p => (
                <div key={p.title} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{p.icon}</div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    marginBottom: '0.75rem',
                    display: 'inline-block',
                    borderBottom: `3px solid ${p.accent}`,
                    paddingBottom: '4px',
                  }}>{p.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services grid ── */}
        <section style={{ padding: '4rem 2rem', background: 'var(--white-soft)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.625rem' }}>L'écosystème en un coup d'œil</h2>
              <p style={{ color: 'var(--muted)' }}>Accédez à l'ensemble des espaces disponibles.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
              {SERVICES.map(s => (
                <Link key={s.label} href={s.href} className="card" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem',
                  padding: '1.25rem',
                  transition: 'box-shadow 0.15s',
                }}>
                  <span style={{ fontSize: '1.875rem' }}>{s.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy)' }}>{s.label}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Derniers articles ── */}
        {articles.length > 0 && (
          <section style={{ padding: '4rem 2rem', background: 'white' }}>
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Derniers articles</h2>
                <Link href="/blog" style={{ fontSize: '0.875rem', color: 'var(--blue)', fontWeight: 500 }}>
                  Voir tout →
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {articles.slice(0, 3).map((a: any) => (
                  <Link key={a.id} href={`/blog/${a.slug}`} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {a.category && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--blue)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {a.category.name}
                      </span>
                    )}
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{a.title}</h3>
                    {a.excerpt && (
                      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                        {a.excerpt.slice(0, 100)}{a.excerpt.length > 100 ? '…' : ''}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section style={{ background: 'var(--gold)', padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.875rem', color: 'var(--navy)', marginBottom: '0.875rem' }}>
              Vous avez quelque chose à apporter ?
            </h2>
            <p style={{ color: '#453800', marginBottom: '2rem', fontSize: '1rem' }}>
              Proposez une compétence, partagez un savoir, contribuez à construire.
              Le Réseau GAMAD accueille celles et ceux qui souhaitent agir.
            </p>
            <Link href="/rejoindre" className="btn btn-navy" style={{ padding: '0.75rem 2rem', fontSize: '0.9375rem' }}>
              Soumettre ma candidature
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
