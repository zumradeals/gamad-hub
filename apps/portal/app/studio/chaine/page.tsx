'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { authGet, authPost, authPut, getToken } from '../../../lib/api';

interface Channel {
  id: string;
  slug: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isOfficial: boolean;
  createdAt: string;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
}

export default function StudioChainePage() {
  const router = useRouter();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNew, setIsNew] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!getToken()) { router.replace('/connexion'); return; }
    authGet<Channel | null>('/portal/channels/me')
      .then(ch => {
        if (ch) {
          setChannel(ch);
          setName(ch.name);
          setSlug(ch.slug);
          setDescription(ch.description ?? '');
          setAvatarUrl(ch.avatarUrl ?? '');
          setBannerUrl(ch.bannerUrl ?? '');
        } else {
          setIsNew(true);
        }
        setLoading(false);
      })
      .catch(() => { setIsNew(true); setLoading(false); });
  }, [router]);

  function handleNameChange(v: string) {
    setName(v);
    if (!slugManuallyEdited) setSlug(slugify(v));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        bannerUrl: bannerUrl.trim() || undefined,
      };
      const saved = await (isNew
        ? authPost<Channel>('/portal/channels', payload)
        : authPut<Channel>('/portal/channels', payload));
      setChannel(saved);
      setIsNew(false);
      setSuccess('Chaîne sauvegardée avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message ?? 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: '#f0f2f5' }}>

        <div style={{ background: '#071326', padding: '2rem 2rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              <Link href="/studio" style={{ color: '#9ca3af', textDecoration: 'none' }}>Studio</Link> › Ma chaîne
            </p>
            <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>📺 Ma chaîne</h1>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem' }}>

          {/* Studio nav */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { href: '/studio',         label: '📊 Tableau de bord' },
              { href: '/studio/videos',  label: '🎬 Mes vidéos' },
              { href: '/studio/chaine',  label: '📺 Ma chaîne', active: true },
              { href: '/studio/revenus', label: '💰 Revenus' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: '0.5rem 1rem', borderRadius: 8, textDecoration: 'none',
                background: (l as any).active ? '#071326' : '#fff',
                color: (l as any).active ? '#fff' : '#6B7280',
                border: `1px solid ${(l as any).active ? '#071326' : '#E5E7EB'}`,
                fontSize: '0.875rem', fontWeight: (l as any).active ? 700 : 400,
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          {loading && <p style={{ color: '#6B7280' }}>Chargement…</p>}

          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

              {/* Form */}
              <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.75rem' }}>
                <h2 style={{ fontWeight: 700, color: '#071326', fontSize: '1.0625rem', marginBottom: '1.5rem' }}>
                  {isNew ? '✨ Créer ma chaîne' : 'Modifier ma chaîne'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* Name */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: 4, fontSize: '0.9375rem' }}>
                      Nom de la chaîne *
                    </label>
                    <input
                      value={name}
                      onChange={e => handleNameChange(e.target.value)}
                      placeholder="Ma super chaîne"
                      required
                      maxLength={60}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.9375rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: 4, fontSize: '0.9375rem' }}>
                      Identifiant URL *
                      <span style={{ marginLeft: 6, fontWeight: 400, color: '#6B7280', fontSize: '0.8125rem' }}>minuscules, chiffres, tirets</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                        fontSize: '0.875rem', color: '#9ca3af', pointerEvents: 'none',
                      }}>
                        /c/
                      </span>
                      <input
                        value={slug}
                        onChange={e => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugManuallyEdited(true); }}
                        required
                        maxLength={40}
                        style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2rem', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.9375rem', boxSizing: 'border-box', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: 4, fontSize: '0.9375rem' }}>Description</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Présentez votre chaîne en quelques mots…"
                      rows={4}
                      maxLength={500}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.9375rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>{description.length}/500</p>
                  </div>

                  {/* Avatar URL */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: 4, fontSize: '0.9375rem' }}>
                      Avatar (URL image)
                    </label>
                    <input
                      value={avatarUrl}
                      onChange={e => setAvatarUrl(e.target.value)}
                      placeholder="https://…"
                      type="url"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.9375rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Banner URL */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: 4, fontSize: '0.9375rem' }}>
                      Bannière (URL image)
                      <span style={{ marginLeft: 6, fontWeight: 400, color: '#6B7280', fontSize: '0.8125rem' }}>recommandé 1600×400px</span>
                    </label>
                    <input
                      value={bannerUrl}
                      onChange={e => setBannerUrl(e.target.value)}
                      placeholder="https://…"
                      type="url"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.9375rem', boxSizing: 'border-box' }}
                    />
                  </div>

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

                  <button type="submit" disabled={saving || !name.trim() || !slug.trim()}
                    style={{
                      background: saving || !name.trim() || !slug.trim() ? 'rgba(229,193,0,0.4)' : '#E5C100',
                      color: '#071326', border: 'none', borderRadius: 8,
                      padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '1rem',
                      cursor: saving || !name.trim() || !slug.trim() ? 'not-allowed' : 'pointer',
                    }}>
                    {saving ? 'Sauvegarde…' : isNew ? '✨ Créer la chaîne' : '💾 Sauvegarder'}
                  </button>
                </div>
              </form>

              {/* Preview */}
              <div>
                <h3 style={{ fontWeight: 700, color: '#071326', marginBottom: '0.875rem', fontSize: '0.9375rem' }}>
                  Aperçu de la chaîne
                </h3>

                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  {/* Banner */}
                  <div style={{
                    height: 100, background: bannerUrl ? undefined : 'linear-gradient(135deg, #071326 0%, #1696D2 100%)',
                    overflow: 'hidden',
                  }}>
                    {bannerUrl && <img src={bannerUrl} alt="bannière" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>

                  {/* Avatar + info */}
                  <div style={{ padding: '1rem', position: 'relative' }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: '#071326', border: '3px solid #fff',
                      position: 'absolute', top: -30, left: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {avatarUrl
                        ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ color: '#E5C100', fontWeight: 700, fontSize: '1.125rem' }}>
                            {name ? name.slice(0, 1).toUpperCase() : '?'}
                          </span>
                      }
                    </div>

                    <div style={{ marginTop: 36 }}>
                      <p style={{ fontWeight: 700, color: '#071326', fontSize: '1rem', marginBottom: 2 }}>
                        {name || 'Nom de la chaîne'}
                      </p>
                      {slug && (
                        <p style={{ fontSize: '0.75rem', color: '#1696D2', fontFamily: 'monospace', marginBottom: 6 }}>
                          /c/{slug}
                        </p>
                      )}
                      {description && (
                        <p style={{ fontSize: '0.8125rem', color: '#6B7280', lineHeight: 1.55 }}>
                          {description.slice(0, 100)}{description.length > 100 ? '…' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {channel && (
                  <div style={{ marginTop: '1rem', background: 'rgba(22,150,210,0.06)', border: '1px solid rgba(22,150,210,0.2)', borderRadius: 10, padding: '0.875rem' }}>
                    <p style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: 600, marginBottom: '0.375rem' }}>
                      ✓ Chaîne active
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      Vos vidéos peuvent maintenant être rattachées à cette chaîne.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
