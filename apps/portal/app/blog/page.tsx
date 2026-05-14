export default function BlogPage() {
  return (
    <main style={{ background: '#f8f7f4', minHeight: '100vh', padding: '3rem 2rem', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Blog
        </h1>
        <p style={{ color: '#6b6b6b', marginBottom: '3rem' }}>Articles éditoriaux et perspectives.</p>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <p style={{ color: '#9b9b9b', fontSize: '0.875rem' }}>Aucun article publié pour le moment.</p>
        </div>
      </div>
    </main>
  );
}
