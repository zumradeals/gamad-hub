'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { getToken, getUser, authPost, authGet, publicGet } from '../../../lib/api';

const C = {
  gold:   '#E5C100',
  blue:   '#1696D2',
  green:  '#0E9F4B',
  navy:   '#071326',
  muted:  '#6B7280',
  border: '#E5E7EB',
  bg:     '#f0f2f5',
};

/* ── helpers ── */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}
function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
function estimateReadTime(text: string): number {
  return Math.max(1, Math.ceil(wordCount(text) / 200));
}

/* ── Tag chip input ── */
function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('');
  function addTag() {
    const t = input.trim().toLowerCase();
    if (!t || tags.includes(t) || tags.length >= 5) return;
    onChange([...tags, t]);
    setInput('');
  }
  function removeTag(t: string) { onChange(tags.filter(x => x !== t)); }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1]);
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', padding: '0.5rem 0.75rem', border: `1px solid ${C.border}`, borderRadius: 8, background: '#fff', minHeight: 42, alignItems: 'center', cursor: 'text' }}>
      {tags.map(t => (
        <span key={t} style={{ background: '#EBF5FB', color: C.blue, fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 20, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          #{t}
          <button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.blue, fontSize: '0.9rem', padding: 0, lineHeight: 1 }}>×</button>
        </span>
      ))}
      {tags.length < 5 && (
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          onBlur={addTag}
          placeholder={tags.length === 0 ? 'Ajouter un tag (Entrée)…' : ''}
          style={{ border: 'none', outline: 'none', fontSize: '0.875rem', flex: 1, minWidth: 100 }}
        />
      )}
    </div>
  );
}

/* ── Label helper ── */
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: C.navy, marginBottom: '0.375rem' }}>
      {children}{required && <span style={{ color: '#DC2626' }}> *</span>}
    </label>
  );
}

/* ── Input styles ── */
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8,
  border: `1px solid ${C.border}`, fontSize: '0.9rem',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  background: '#fff', color: C.navy,
};

/* ── Toast ── */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: type === 'success' ? C.green : '#DC2626',
      color: '#fff', fontWeight: 700, fontSize: '0.9rem',
      padding: '0.75rem 1.5rem', borderRadius: 10, zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>{message}</div>
  );
}

/* ── Preview panel ── */
function PreviewPanel({ title, excerpt, content, videoUrl }: { title: string; excerpt: string; content: string; videoUrl: string }) {
  const rt    = estimateReadTime(content);
  const words = wordCount(content);
  const preview = content.substring(0, 600) + (content.length > 600 ? '…' : '');
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Aperçu</div>

      {title ? (
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: C.navy, lineHeight: 1.3, margin: 0 }}>{title}</h2>
      ) : (
        <div style={{ height: 32, background: C.bg, borderRadius: 6 }} />
      )}

      {excerpt ? (
        <p style={{ color: C.muted, fontSize: '0.9rem', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>{excerpt}</p>
      ) : null}

      {videoUrl && (
        <span style={{ background: C.blue, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 4, alignSelf: 'flex-start' }}>▶ Article Vidéo</span>
      )}

      <div style={{ fontSize: '0.8rem', color: C.green, fontWeight: 600 }}>⏱ Temps de lecture estimé : {rt} min</div>
      <div style={{ fontSize: '0.75rem', color: C.muted }}>{words} mot{words !== 1 ? 's' : ''}</div>

      {preview ? (
        <p style={{ fontSize: '0.85rem', color: '#1a1a2e', lineHeight: 1.7, whiteSpace: 'pre-wrap', flex: 1, overflow: 'hidden', margin: 0 }}>
          {preview}
        </p>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '0.85rem' }}>
          Le contenu apparaîtra ici…
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════ MAIN PAGE ══════════════════════════════════════ */
export default function EcrirePage() {
  return <Suspense><EcrirePageInner /></Suspense>;
}

function EcrirePageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const editId       = searchParams?.get('id') ?? null;

  const [title,       setTitle]       = useState('');
  const [slug,        setSlug]        = useState('');
  const [slugEdited,  setSlugEdited]  = useState(false);
  const [excerpt,     setExcerpt]     = useState('');
  const [imageUrl,    setImageUrl]    = useState('');
  const [videoUrl,    setVideoUrl]    = useState('');
  const [categoryId,  setCategoryId]  = useState('');
  const [tags,        setTags]        = useState<string[]>([]);
  const [content,     setContent]     = useState('');
  const [sponsored,   setSponsored]   = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorUrl,  setSponsorUrl]  = useState('');

  const [categories,  setCategories]  = useState<{ id: string; name: string }[]>([]);
  const [trustLevel,  setTrustLevel]  = useState<string | null>(null);
  const [savedId,     setSavedId]     = useState<string | null>(editId);

  const [saving,      setSaving]      = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');
  const [toast,       setToast]       = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /* ── auth guard ── */
  useEffect(() => {
    if (!getToken()) { router.push('/connexion'); return; }
    authGet<{ reputation?: { trustLevel: string } }>('/portal/wallet')
      .then(d => setTrustLevel(d.reputation?.trustLevel ?? null))
      .catch(() => {});
    publicGet<{ id: string; name: string }[]>('/portal/blog/categories')
      .then(setCategories)
      .catch(() => {});
    // si mode édition : charger l'article
    if (editId) {
      authGet<any>(`/portal/blog/${editId}`)
        .then(a => {
          setTitle(a.title ?? '');
          setSlug(a.slug ?? '');
          setSlugEdited(true);
          setExcerpt(a.excerpt ?? '');
          setImageUrl(a.imageUrl ?? '');
          setVideoUrl(a.videoUrl ?? '');
          setCategoryId(a.categoryId ?? a.category?.id ?? '');
          setTags(a.tags ?? []);
          setContent(a.content ?? '');
          setSponsored(a.sponsored ?? false);
          setSponsorName(a.sponsorName ?? '');
          setSponsorUrl(a.sponsorUrl ?? '');
        })
        .catch(() => {});
    }
  }, [router, editId]);

  /* ── slug auto ── */
  useEffect(() => {
    if (!slugEdited) setSlug(slugify(title));
  }, [title, slugEdited]);

  /* ── save draft ── */
  async function saveDraft() {
    if (!title.trim() || !content.trim()) { setError('Le titre et le contenu sont requis.'); return; }
    setError('');
    setSaving(true);
    try {
      const payload: any = {
        title, excerpt: excerpt || undefined, imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || undefined, categoryId: categoryId || undefined,
        tags, content, sponsored,
        ...(sponsored && sponsorName ? { sponsorName, sponsorUrl: sponsorUrl || undefined } : {}),
      };
      let article;
      if (savedId) {
        article = await authPost<any>(`/portal/blog/${savedId}`, { ...payload, _method: 'PATCH' });
      } else {
        article = await authPost<any>('/portal/blog', payload);
        setSavedId(article.id);
      }
      setToast({ message: 'Brouillon enregistré !', type: 'success' });
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  /* ── submit ── */
  async function handleSubmit() {
    if (!title.trim() || !content.trim()) { setError('Le titre et le contenu sont requis.'); return; }
    setError('');
    setSubmitting(true);
    try {
      let id = savedId;
      if (!id) {
        const payload: any = {
          title, excerpt: excerpt || undefined, imageUrl: imageUrl || undefined,
          videoUrl: videoUrl || undefined, categoryId: categoryId || undefined,
          tags, content, sponsored,
          ...(sponsored && sponsorName ? { sponsorName, sponsorUrl: sponsorUrl || undefined } : {}),
        };
        const article = await authPost<any>('/portal/blog', payload);
        id = article.id;
        setSavedId(id);
      }
      await authPost(`/portal/blog/${id}/submit`, {});
      setToast({ message: 'Article soumis à la rédaction !', type: 'success' });
      setTimeout(() => router.push('/blog/mes-articles'), 1500);
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de la soumission.');
    } finally {
      setSubmitting(false);
    }
  }

  const isModerated = trustLevel === 'NEWCOMER' || trustLevel === 'MEMBER';
  const wc          = wordCount(content);
  const rt          = estimateReadTime(content);

  return (
    <>
      <Nav />
      <main style={{ background: C.bg, minHeight: '100vh' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <Link href="/blog" style={{ color: C.blue, fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>← Blog</Link>
            <span style={{ color: C.muted, fontSize: '0.875rem' }}>/</span>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: C.navy, margin: 0 }}>
              {editId ? "Modifier l'article" : '✍️ Écrire un article'}
            </h1>
          </div>

          {/* Encart info ZAHAB */}
          <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1a2a4a 100%)`, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.5rem' }}>📿</span>
            <div>
              <span style={{ color: C.gold, fontWeight: 700, fontSize: '0.9rem' }}>Votre article rapporte +20 Z à la publication</span>
              <p style={{ margin: '0.2rem 0 0', color: '#a0b0c8', fontSize: '0.8rem' }}>Plus vous publiez, plus vous gagnez. Les lectures vous rapportent aussi +0.5 Z chacune.</p>
            </div>
          </div>

          {/* Warning niveau */}
          {isModerated && (
            <div style={{ background: '#fffbeb', border: `1px solid ${C.gold}`, borderRadius: 10, padding: '0.875rem 1.125rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#92400e' }}>
              ⚠️ Votre article sera soumis à modération avant publication (niveau {trustLevel}). Continuez à contribuer pour débloquer la publication directe.
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#991b1b' }}>
              {error}
            </div>
          )}

          {/* ── 2 colonnes ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

            {/* ══ Colonne éditeur ══ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Titre */}
              <div>
                <Label required>Titre</Label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value.substring(0, 200))}
                  placeholder="Un titre clair et accrocheur…"
                  style={{ ...inputStyle, fontSize: '1.0625rem', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                  <div style={{ fontSize: '0.75rem', color: C.muted }}>URL : gamad.net/blog/<span style={{ fontFamily: 'monospace', color: C.blue }}>{slug || 'votre-slug'}</span></div>
                  <div style={{ fontSize: '0.75rem', color: title.length > 180 ? '#DC2626' : C.muted }}>{title.length}/200</div>
                </div>
              </div>

              {/* Extrait */}
              <div>
                <Label>Extrait</Label>
                <textarea
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value.substring(0, 400))}
                  placeholder="Résumé court affiché dans les listings (max 400 caractères)…"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                />
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: excerpt.length > 380 ? '#DC2626' : C.muted }}>{excerpt.length}/400</div>
              </div>

              {/* Image cover */}
              <div>
                <Label>URL de l'image de couverture</Label>
                <input
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                  style={inputStyle}
                />
              </div>

              {/* Vidéo YouTube */}
              <div>
                <Label>URL Vidéo YouTube (optionnel)</Label>
                <input
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  type="url"
                  style={inputStyle}
                />
                {videoUrl && (
                  <div style={{ marginTop: '0.375rem' }}>
                    <span style={{ background: C.blue, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 4 }}>▶ Article Vidéo activé</span>
                  </div>
                )}
              </div>

              {/* Catégorie */}
              <div>
                <Label>Catégorie</Label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">— Sélectionner une catégorie —</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags <span style={{ fontWeight: 400, color: C.muted, fontSize: '0.8rem' }}>(max 5)</span></Label>
                <TagInput tags={tags} onChange={setTags} />
              </div>

              {/* Contenu */}
              <div>
                <Label required>Contenu de l'article</Label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Rédigez votre article ici…"
                  rows={20}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.75, minHeight: 400 }}
                />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.375rem', fontSize: '0.75rem', color: C.muted }}>
                  <span>{wc} mot{wc !== 1 ? 's' : ''}</span>
                  <span>⏱ ~{rt} min de lecture</span>
                </div>
              </div>

              {/* Toggle sponsorisé */}
              <div style={{ background: '#fff', borderRadius: 10, padding: '1rem', border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: sponsored ? '1rem' : 0 }}>
                  <button
                    type="button"
                    onClick={() => setSponsored(p => !p)}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: sponsored ? C.gold : '#D1D5DB',
                      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2, left: sponsored ? 22 : 2,
                      width: 20, height: 20, background: '#fff', borderRadius: '50%',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                  <span style={{ fontWeight: 700, color: C.navy, fontSize: '0.875rem' }}>Article sponsorisé</span>
                  {sponsored && <span style={{ background: C.gold, color: C.navy, fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: 3 }}>SPONSORISÉ</span>}
                </div>
                {sponsored && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <Label>Nom du sponsor</Label>
                      <input value={sponsorName} onChange={e => setSponsorName(e.target.value)} placeholder="ACME Corporation" style={inputStyle} />
                    </div>
                    <div>
                      <Label>URL du sponsor</Label>
                      <input value={sponsorUrl} onChange={e => setSponsorUrl(e.target.value)} placeholder="https://sponsor.com" type="url" style={inputStyle} />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Boutons d'action ── */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
                <button
                  onClick={saveDraft}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem',
                    background: '#fff', color: C.navy, border: `2px solid ${C.navy}`,
                    cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                  }}
                >{saving ? 'Enregistrement…' : '💾 Enregistrer le brouillon'}</button>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || saving || !title.trim() || !content.trim()}
                  style={{
                    padding: '0.75rem 1.75rem', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem',
                    background: (!submitting && !saving && title.trim() && content.trim()) ? C.gold : C.muted,
                    color: C.navy, border: 'none',
                    cursor: (submitting || saving || !title.trim() || !content.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (submitting || saving) ? 0.7 : 1,
                  }}
                >{submitting ? 'Soumission…' : '🚀 Soumettre à la rédaction'}</button>
              </div>
            </div>

            {/* ══ Colonne preview ══ */}
            <div style={{ position: 'sticky', top: 80 }}>
              <PreviewPanel title={title} excerpt={excerpt} content={content} videoUrl={videoUrl} />
            </div>

          </div>
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Footer />
    </>
  );
}
