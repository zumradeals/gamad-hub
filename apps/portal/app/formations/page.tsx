import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { publicGet } from '../../lib/api';

export default async function FormationsPage() {
  const formations = await publicGet<any[]>('/public/formations?take=20').catch(() => []);

  return (
    <>
      <Nav />
      <main>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Formations</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
            Parcours de formation accessibles à tous.
          </p>

          {formations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Aucune formation disponible pour le moment.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {formations.map((f: any) => (
                <Link key={f.id} href={`/formations/${f.slug}`} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {f.imageUrl && (
                    <div style={{ height: 160, background: '#e5e2dc', overflow: 'hidden' }}>
                      <img src={f.imageUrl} alt={f.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '1.375rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{f.title}</h2>
                    {f.description && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55 }}>
                        {f.description.slice(0, 110)}{f.description.length > 110 ? '…' : ''}
                      </p>
                    )}
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {f._count?.modules !== undefined && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          {f._count.modules} module{f._count.modules !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span style={{ color: 'var(--teal)', fontSize: '0.875rem', fontWeight: 500 }}>
                        Accéder →
                      </span>
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
