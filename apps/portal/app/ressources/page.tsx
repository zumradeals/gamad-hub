import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { publicGet } from '../../lib/api';

const TYPE_LABEL: Record<string, string> = {
  STATUTE: 'Statut', REPORT: 'Rapport', MANUAL: 'Manuel',
  PROCEDURE: 'Procédure', MEDIA: 'Média', ARCHIVE: 'Archive', TRAINING: 'Formation',
};

export default async function RessourcesPage() {
  const docs = await publicGet<any[]>('/public/resources?take=30').catch(() => []);

  return (
    <>
      <Nav />
      <main>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ressources</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
            Bibliothèque de documents publics accessibles à tous.
          </p>

          {docs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Aucune ressource disponible pour le moment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {docs.map((d: any) => (
                <div key={d.id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '1.125rem 1.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 2 }}>{d.title}</div>
                    {d.organizationUnit && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{d.organizationUnit.name}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      background: 'var(--teal-light)',
                      color: 'var(--teal)',
                      border: '1px solid #0f6e5620',
                    }}>
                      {TYPE_LABEL[d.documentType] ?? d.documentType}
                    </span>
                    {d._count?.versions > 0 && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        v{d._count.versions}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
