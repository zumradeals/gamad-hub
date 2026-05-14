export default function IdentityPage() {
  return (
    <div>
      <h1 style={{ color: '#e6edf3', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Mon identité
      </h1>
      <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Votre existence numérique dans le monde GAMAD.
      </p>
      <div style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: 8,
        padding: '1.5rem',
        maxWidth: 480,
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: 4 }}>GAMAD ID</p>
          <p style={{ color: '#d4a017', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em' }}>
            GMD-000000
          </p>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: 4 }}>Statut</p>
          <span style={{
            display: 'inline-block',
            background: '#1a3a2a',
            color: '#3fb950',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>ACTIF</span>
        </div>
        <div>
          <p style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: 4 }}>Nom affiché</p>
          <p style={{ color: '#e6edf3' }}>Citoyen GAMAD</p>
        </div>
      </div>
    </div>
  );
}
