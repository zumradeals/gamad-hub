'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { authPost, authGet, getToken } from '../../../lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function PublierVideoPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [sponsored, setSponsored] = useState(false);
  const [sponsorName, setSponsorName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const ytId = extractYouTubeId(youtubeUrl);
  const previewThumb = thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

  useEffect(() => {
    if (!getToken()) { router.replace('/connexion'); return; }
    authGet<Category[]>('/portal/videos/categories').then(setCategories).catch(() => {});
  }, [router]);

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  }

  function removeTag(t: string) {
    setTags(prev => prev.filter(x => x !== t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!youtubeUrl.trim() || !title.trim()) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await authPost('/portal/videos', {
        youtubeUrl: youtubeUrl.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        durationMin: durationMin ? Number(durationMin) : undefined,
        categoryId: categoryId || undefined,
        tags,
        sponsored,
        sponsorName: sponsored && sponsorName.trim() ? sponsorName.trim() : undefined,
      });
      setSuccess('Vidéo soumise avec succès ! Elle sera publiée après validation.');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 2rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#071326', marginBottom: '0.375rem' }}>
              🎬 Publier une vidéo
            </h1>
            <p style={{ color: '#6B7280' }}>
              Partagez votre contenu YouTube sur GamadTube. <strong style={{ color: '#0E9F4B' }}>+30 ZAHAB</strong> à la publication approuvée.
            </p>
          </div>

          {/* ZAHAB info */}
          <div style={{
            background: 'rgba(229,193,0,0.08)', border: '1px solid rgba(229,193,0,0.3)',
            borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.75rem',
            display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
          }}>
            {[
              { icon: '🎬', label: 'Publication', value: '+30Z' },
              { icon: '▶', label: 'Par visionnage', value: '+0.5Z vue' },
              { icon: '🏆', label: 'Palier 100 vues', value: '+20Z' },
              { icon: '🏆', label: 'Palier 1k vues', value: '+100Z' },
              { icon: '🏆', label: 'Palier 10k vues', value: '+500Z' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.125rem' }}>{r.icon}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#b8960a' }}>{r.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#71600a' }}>{r.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* YouTube URL */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
                  URL YouTube *
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  required
                  style={{
                    width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8,
                    border: '1px solid #E5E7EB', fontSize: '0.9375rem', color: '#071326',
                    boxSizing: 'border-box',
                  }}
                />
                {ytId && (
                  <p style={{ fontSize: '0.75rem', color: '#0E9F4B', marginTop: '0.25rem' }}>
                    ✓ ID YouTube détecté : {ytId}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
                  Titre *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Titre de votre vidéo"
                  maxLength={120}
                  required
                  style={{
                    width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8,
                    border: '1px solid #E5E7EB', fontSize: '0.9375rem', color: '#071326',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Décrivez le contenu de votre vidéo…"
                  rows={4}
                  style={{
                    width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8,
                    border: '1px solid #E5E7EB', fontSize: '0.9375rem', color: '#071326',
                    resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Category + Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
                    Catégorie
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    style={{
                      width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8,
                      border: '1px solid #E5E7EB', fontSize: '0.9375rem', color: '#071326',
                      background: '#fff', boxSizing: 'border-box',
                    }}
                  >
                    <option value="">— Choisir —</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
                    Durée (min)
                  </label>
                  <input
                    type="number"
                    value={durationMin}
                    onChange={e => setDurationMin(e.target.value)}
                    placeholder="Ex: 12"
                    min={0}
                    style={{
                      width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8,
                      border: '1px solid #E5E7EB', fontSize: '0.9375rem', color: '#071326',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Thumbnail override */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
                  Miniature personnalisée (URL)
                  <span style={{ fontWeight: 400, color: '#6B7280', marginLeft: 6, fontSize: '0.8125rem' }}>optionnel, sinon miniature YouTube</span>
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={e => setThumbnailUrl(e.target.value)}
                  placeholder="https://…"
                  style={{
                    width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8,
                    border: '1px solid #E5E7EB', fontSize: '0.9375rem', color: '#071326',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
                  Tags
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Ajouter un tag…"
                    style={{
                      flex: 1, padding: '0.5rem 0.875rem', borderRadius: 8,
                      border: '1px solid #E5E7EB', fontSize: '0.875rem', color: '#071326',
                    }}
                  />
                  <button type="button" onClick={addTag}
                    style={{ background: '#f0f2f5', border: '1px solid #E5E7EB', borderRadius: 8, padding: '0.5rem 0.875rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                    Ajouter
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {tags.map(t => (
                    <span key={t} style={{
                      background: 'rgba(22,150,210,0.1)', border: '1px solid rgba(22,150,210,0.3)',
                      borderRadius: 20, padding: '0.2rem 0.625rem', fontSize: '0.8125rem', color: '#1696D2',
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                    }}>
                      #{t}
                      <button type="button" onClick={() => removeTag(t)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1696D2', padding: 0, lineHeight: 1 }}>
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Sponsorisé */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={sponsored} onChange={e => setSponsored(e.target.checked)} />
                  <span style={{ fontWeight: 600, color: '#071326', fontSize: '0.9375rem' }}>Contenu sponsorisé</span>
                </label>
                {sponsored && (
                  <input
                    type="text"
                    value={sponsorName}
                    onChange={e => setSponsorName(e.target.value)}
                    placeholder="Nom du sponsor"
                    style={{
                      marginTop: '0.5rem', width: '100%', padding: '0.5rem 0.875rem',
                      borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.9375rem', color: '#071326',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
              </div>

              {/* Messages */}
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ background: 'rgba(14,159,75,0.1)', border: '1px solid rgba(14,159,75,0.3)', borderRadius: 8, padding: '0.75rem 1rem', color: '#0E9F4B', fontSize: '0.875rem' }}>
                  ✓ {success}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !youtubeUrl.trim() || !title.trim()}
                style={{
                  background: submitting || !youtubeUrl.trim() || !title.trim() ? 'rgba(229,193,0,0.5)' : '#E5C100',
                  color: '#071326', border: 'none', borderRadius: 8,
                  padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '1rem',
                  cursor: submitting || !youtubeUrl.trim() || !title.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Envoi en cours…' : '🚀 Soumettre la vidéo'}
              </button>
            </form>

            {/* Preview */}
            <div>
              <h3 style={{ fontWeight: 700, color: '#071326', marginBottom: '0.875rem', fontSize: '0.9375rem' }}>
                Aperçu
              </h3>
              <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#071326' }}>
                  {previewThumb
                    ? <img src={previewThumb} alt="preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#4b5563', fontSize: '2rem' }}>▶</span>
                      </div>
                  }
                </div>
                <div style={{ padding: '0.875rem' }}>
                  <p style={{ fontWeight: 600, color: '#071326', fontSize: '0.9375rem', lineHeight: 1.35, marginBottom: 6 }}>
                    {title || 'Titre de votre vidéo'}
                  </p>
                  {categoryId && categories.find(c => c.id === categoryId) && (
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {categories.find(c => c.id === categoryId)?.name}
                    </span>
                  )}
                  <div style={{ marginTop: 8, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(229,193,0,0.15)', color: '#b8960a', padding: '2px 8px', borderRadius: 4, fontSize: '0.6875rem', fontWeight: 700 }}>
                      +0.5Z / vue
                    </span>
                    <span style={{ background: 'rgba(14,159,75,0.15)', color: '#0E9F4B', padding: '2px 8px', borderRadius: 4, fontSize: '0.6875rem', fontWeight: 700 }}>
                      +30Z publication
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', background: 'rgba(22,150,210,0.06)', border: '1px solid rgba(22,150,210,0.2)', borderRadius: 10, padding: '0.875rem' }}>
                <p style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: 600, marginBottom: '0.375rem' }}>
                  ℹ️ Processus de validation
                </p>
                <ul style={{ fontSize: '0.75rem', color: '#6B7280', paddingLeft: '1rem', lineHeight: 1.8 }}>
                  <li>Soumission à la salle de rédaction</li>
                  <li>Vérification par un éditeur GAMAD</li>
                  <li>Publication et créditement ZAHAB</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
