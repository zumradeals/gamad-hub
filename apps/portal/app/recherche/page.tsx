export default function RecherchePage() {
  return (
    <main style={{ background: '#f8f7f4', minHeight: '100vh', padding: '2rem', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: '#ffffff',
          border: '1.5px solid #1a1a1a',
          borderRadius: 8,
          padding: '0.75rem 1rem',
          marginBottom: '2rem',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Affiner votre recherche..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', color: '#1a1a1a' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          {['Tout', 'Formations', 'Articles', 'Vidéos', 'Ressources'].map((f) => (
            <button key={f} style={{
              padding: '0.375rem 0.875rem',
              border: '1px solid #e5e2dc',
              borderRadius: 20,
              fontSize: '0.8125rem',
              background: f === 'Tout' ? '#1a1a1a' : '#ffffff',
              color: f === 'Tout' ? '#f8f7f4' : '#6b6b6b',
              cursor: 'pointer',
            }}>{f}</button>
          ))}
        </div>
        <p style={{ color: '#6b6b6b', fontSize: '0.875rem' }}>Entrez un terme de recherche pour afficher les résultats.</p>
      </div>
    </main>
  );
}
