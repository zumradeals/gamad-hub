import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { publicGet } from '../../lib/api';

async function getData() {
  const [videos, categories] = await Promise.all([
    publicGet<any[]>('/public/videos?take=20').catch(() => []),
    publicGet<any[]>('/public/videos/categories').catch(() => []),
  ]);
  return { videos, categories };
}

export default async function TvPage() {
  const { videos, categories } = await getData();

  return (
    <>
      <Nav />
      <main>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>GAMAD TV</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
            Vidéos éducatives, documentaires et conférences.
          </p>

          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {categories.map((c: any) => (
                <span key={c.id} style={{
                  padding: '0.3125rem 0.875rem',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-card)',
                }}>
                  {c.name}
                </span>
              ))}
            </div>
          )}

          {videos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Aucune vidéo disponible pour le moment.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {videos.map((v: any) => (
                <Link key={v.id} href={`/tv/${v.slug}`} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <div style={{
                    height: 170,
                    background: '#1a1a1a',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {v.thumbnailUrl
                      ? <img src={v.thumbnailUrl} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                      : <span style={{ color: '#fff', fontSize: '2.5rem' }}>▶</span>
                    }
                    {v.duration && (
                      <span style={{
                        position: 'absolute', bottom: 8, right: 8,
                        background: 'rgba(0,0,0,0.75)', color: '#fff',
                        fontSize: '0.75rem', padding: '2px 6px', borderRadius: 3,
                      }}>
                        {Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{v.title}</h2>
                    {v.category && <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{v.category.name}</span>}
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
