export default function HomePage() {
  return (
    <div>
      <h1 style={{ color: '#e6edf3', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Tableau de bord
      </h1>
      <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Bienvenue dans votre espace citoyen GAMAD.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {['Activités récentes', 'Formations en cours', 'Messages', 'Cotisation'].map((card) => (
          <div key={card} style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: '1.25rem',
          }}>
            <p style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: 8 }}>{card}</p>
            <p style={{ color: '#e6edf3', fontWeight: 600 }}>—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
