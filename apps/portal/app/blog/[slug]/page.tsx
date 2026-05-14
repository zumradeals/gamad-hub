import { notFound } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { publicGet } from '../../../lib/api';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await publicGet<any>(`/public/articles/${slug}`).catch(() => null);
  if (!article) notFound();

  const readingTime = Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200));

  return (
    <>
      <Nav />
      <main>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 2rem' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <Link href="/blog" style={{ color: 'var(--teal)' }}>Blog</Link>
            <span>›</span>
            {article.category && (
              <>
                <span style={{ color: 'var(--text-secondary)' }}>{article.category.name}</span>
                <span>›</span>
              </>
            )}
            <span style={{ color: 'var(--text-secondary)' }}>{article.title}</span>
          </div>

          {/* Header */}
          {article.category && (
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--teal)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}>
              {article.category.name}
            </div>
          )}
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
            {article.title}
          </h1>

          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {article.publishedAt && (
              <span>{new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            )}
            <span>{readingTime} min de lecture</span>
          </div>

          {/* Hero image */}
          {article.imageUrl && (
            <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: '2.5rem', background: '#e5e2dc' }}>
              <img src={article.imageUrl} alt={article.title} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Content */}
          <div style={{
            fontSize: '1.0625rem',
            lineHeight: 1.8,
            color: 'var(--text)',
            whiteSpace: 'pre-wrap',
          }}>
            {article.content}
          </div>

          {/* Back link */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <Link href="/blog" style={{ color: 'var(--teal)', fontWeight: 500, fontSize: '0.9375rem' }}>
              ← Retour au blog
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
