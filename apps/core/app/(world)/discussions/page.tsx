export default function DiscussionsPage() {
  return (
    <div>
      <h1 style={{ color: '#e6edf3', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Discussions
      </h1>
      <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Forums et espaces d'échange.
      </p>
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '1.5rem' }}>
        <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Aucun fil de discussion actif.</p>
      </div>
    </div>
  );
}
