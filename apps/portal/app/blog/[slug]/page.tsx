import { notFound } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function getArticle(slug: string) {
  const res = await fetch(`${BASE}/portal/blog/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const readingTime = Math.max(1, Math.ceil((article.content ?? '').split(/\s+/).length / 200));

  return (
    <>
      <Nav />
      <main>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 2rem' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
            <Link href="/blog" style={{ color: 'var(--blue)' }}>Blog</Link>
            <span>›</span>
            {article.category && (
              <>
                <span style={{ color: 'var(--muted)' }}>{article.category.name}</span>
                <span>›</span>
              </>
            )}
            <span style={{ color: 'var(--muted)' }}>{article.title}</span>
          </div>

          {/* Catégorie */}
          {article.category && (
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {article.category.name}
            </div>
          )}

          {/* Titre */}
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem', color: 'var(--navy)' }}>
            {article.title}
          </h1>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {article.author?.profile && (
              <span style={{ fontWeight: 500, color: 'var(--navy)' }}>
                {article.author.profile.firstName} {article.author.profile.lastName}
              </span>
            )}
            {article.publishedAt && (
              <span>{new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            )}
            <span>{readingTime} min de lecture</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {(article.viewCount ?? 0).toLocaleString('fr-FR')}
            </span>
          </div>

          {/* Hero image */}
          {article.imageUrl && (
            <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: '2.5rem', background: '#e5e2dc' }}>
              <img src={article.imageUrl} alt={article.title} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Extrait */}
          {article.excerpt && (
            <div style={{ padding: '1rem 1.25rem', background: '#f8f9fa', borderLeft: '3px solid var(--gold)', borderRadius: '0 8px 8px 0', marginBottom: '2rem', fontSize: '1.0625rem', color: 'var(--muted)', fontStyle: 'italic' }}>
              {article.excerpt}
            </div>
          )}

          {/* Contenu */}
          <div style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: '#1a1a2e', whiteSpace: 'pre-wrap' }}>
            {article.content}
          </div>

          {/* Milestones */}
          {(article.milestone100 || article.milestone1k) && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              {article.milestone100 && (
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: 999 }}>
                  🏅 +100 vues
                </span>
              )}
              {article.milestone1k && (
                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: 999 }}>
                  🏆 +1 000 vues
                </span>
              )}
            </div>
          )}

          {/* Footer article */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '3rem', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <Link href="/blog" style={{ color: 'var(--blue)', fontWeight: 500, fontSize: '0.9375rem' }}>
                ← Retour au blog
              </Link>
              <Link href="/blog/new" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                ✍️ Écrire un article
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
