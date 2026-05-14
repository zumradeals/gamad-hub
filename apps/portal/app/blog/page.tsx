import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function getArticles() {
  const res = await fetch(`${BASE}/portal/blog?take=20`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export default async function BlogPage() {
  const articles: any[] = await getArticles().catch(() => []);

  return (
    <>
      <Nav />
      <main>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy)' }}>Blog</h1>
              <p style={{ color: 'var(--muted)', fontSize: '0.9375rem' }}>
                Articles éditoriaux, analyses et perspectives GAMAD.
              </p>
            </div>
            <Link href="/blog/new" className="btn btn-primary">
              ✍️ Écrire un article
            </Link>
          </div>

          {articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
              <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Aucun article publié pour le moment.</p>
              <Link href="/blog/new" className="btn btn-primary">Être le premier à écrire</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {articles.map((a: any) => (
                <Link key={a.id} href={`/blog/${a.slug}`} className="card" style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 0,
                  textDecoration: 'none',
                }}>
                  {a.imageUrl && (
                    <div style={{ height: 180, overflow: 'hidden', background: '#e5e2dc' }}>
                      <img src={a.imageUrl} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {a.category && (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--blue)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {a.category.name}
                      </span>
                    )}
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--navy)', lineHeight: 1.4 }}>{a.title}</h2>
                    {a.excerpt && (
                      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.55 }}>
                        {a.excerpt}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem' }}>
                      {a.publishedAt && (
                        <span style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>
                          {new Date(a.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                      {a.viewCount > 0 && (
                        <span style={{ color: 'var(--muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          {a.viewCount.toLocaleString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
