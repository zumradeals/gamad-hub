'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { getToken, authPost, authGet } from '../../../lib/api';

interface Reputation {
  trustLevel: string;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [trustLevel, setTrustLevel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) { router.push('/connexion'); return; }
    authGet<{ reputation: Reputation }>('/portal/wallet')
      .then(d => setTrustLevel(d.reputation.trustLevel))
      .catch(() => {});
    authGet<any[]>('/portal/blog/me/articles').catch(() => {});
  }, [router]);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(title));
  }, [title, slugEdited]);

  async function saveDraft() {
    if (!title.trim() || !content.trim()) { setError('Titre et contenu requis.'); return; }
    setError('');
    setSaving(true);
    try {
      const article = await authPost<any>('/portal/blog', { title, content, excerpt: excerpt || undefined, categoryId: categoryId || undefined });
      setSavedId(article.id);
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!savedId) { await saveDraft(); if (!savedId) return; }
    if (!savedId) return;
    setPublishing(true);
    try {
      await authPost<any>(`/portal/blog/${savedId}/publish`, {});
      router.push('/dashboard/creator');
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de la publication.');
    } finally {
      setPublishing(false);
    }
  }

  const isModerated = trustLevel === 'NEWCOMER' || trustLevel === 'MEMBER';

  return (
    <>
      <Nav />
      <main style={{ padding: '2.5rem 2rem', minHeight: '80vh' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
            <Link href="/dashboard" style={{ color: 'var(--blue)' }}>Dashboard</Link>
            {' → '}
            <Link href="/dashboard/creator" style={{ color: 'var(--blue)' }}>Espace Créateur</Link>
            {' → '}
            <span>Nouvel article</span>
          </div>

          <h1 style={{ fontSize: '1.625rem', marginBottom: '0.5rem' }}>Écrire un article</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Les articles sont plus longs et structurés que les posts du feed.
            Un article publié rapporte <strong>+20 ZAHAB</strong>.
          </p>

          {isModerated && (
            <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--gold)', background: '#fffbeb' }}>
              <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0 }}>
                Votre article sera soumis à modération avant publication. Continuez à contribuer pour atteindre le niveau Confirmé et publier directement.
              </p>
            </div>
          )}

          {error && (
            <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, marginBottom: '1rem', fontSize: '0.875rem', color: '#991b1b' }}>
              {error}
            </div>
          )}

          {savedId && (
            <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 8, marginBottom: '1rem', fontSize: '0.875rem', color: '#065f46' }}>
              Brouillon sauvegardé.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Titre */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Titre *
              </label>
              <input
                className="form-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Un titre clair et accrocheur"
                style={{ fontSize: '1.125rem' }}
              />
            </div>

            {/* Slug */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                URL de l'article
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>gamad.net/blog/</span>
                <input
                  className="form-input"
                  type="text"
                  value={slug}
                  onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* Extrait */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Extrait (optionnel)
              </label>
              <textarea
                className="form-input"
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Une courte description pour les aperçus..."
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Contenu */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Contenu *
              </label>
              <textarea
                className="form-input"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Rédigez votre article ici..."
                rows={20}
                style={{ resize: 'vertical', lineHeight: 1.7, fontFamily: 'inherit' }}
              />
              <div style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
                {content.split(/\s+/).filter(Boolean).length} mots · ~{Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200))} min de lecture
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
              <button
                onClick={saveDraft}
                disabled={saving}
                className="btn btn-outline"
              >
                {saving ? 'Sauvegarde…' : 'Enregistrer le brouillon'}
              </button>
              <button
                onClick={publish}
                disabled={publishing || saving || !title.trim() || !content.trim()}
                className="btn btn-primary"
              >
                {publishing ? 'Publication…' : isModerated ? 'Soumettre à la modération' : 'Publier l\'article'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
