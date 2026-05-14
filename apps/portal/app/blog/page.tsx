import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { publicGet } from '../../lib/api';

async function getData() {
  const [articles, categories] = await Promise.all([
    publicGet<any[]>('/public/articles?take=20').catch(() => []),
    publicGet<any[]>('/public/articles/categories').catch(() => []),
  ]);
  return { articles, categories };
}

export default async function BlogPage() {
  const { articles, categories } = await getData();

  return (
    <>
      <Nav />
      <main>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Blog</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
            Articles éditoriaux, analyses et perspectives.
          </p>

          {/* Category filters */}
          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <Link href="/blog" style={pill(true)}>Tout</Link>
              {categories.map((c: any) => (
                <Link key={c.id} href={`/blog?category=${c.slug}`} style={pill(false)}>
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {articles.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Aucun article publié pour le moment.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {articles.map((a: any) => (
                <Link key={a.id} href={`/blog/${a.slug}`} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {a.imageUrl && (
                    <div style={{ height: 180, overflow: 'hidden', background: '#e5e2dc' }}>
                      <img src={a.imageUrl} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {a.category && (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--teal)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {a.category.name}
                      </span>
                    )}
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{a.title}</h2>
                    {a.excerpt && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55 }}>
                        {a.excerpt}
                      </p>
                    )}
                    {a.publishedAt && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 'auto' }}>
                        {new Date(a.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    )}
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

function pill(active: boolean): React.CSSProperties {
  return {
    padding: '0.3125rem 0.875rem',
    border: '1px solid var(--border)',
    borderRadius: 20,
    fontSize: '0.8125rem',
    background: active ? 'var(--text)' : 'var(--bg-card)',
    color: active ? 'var(--bg)' : 'var(--text-secondary)',
    fontWeight: active ? 600 : 400,
  };
}
