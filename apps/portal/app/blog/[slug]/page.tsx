export default function ArticlePage({ params }: { params: { slug: string } }) {
  return (
    <main style={{ background: '#f8f7f4', minHeight: '100vh', padding: '3rem 2rem', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <a href="/blog" style={{ color: '#6b6b6b', fontSize: '0.875rem', textDecoration: 'none' }}>← Blog</a>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2rem', fontWeight: 700, margin: '1.5rem 0 1rem' }}>
          Article
        </h1>
        <p style={{ color: '#9b9b9b', fontSize: '0.875rem' }}>Slug : {params.slug}</p>
      </div>
    </main>
  );
}
