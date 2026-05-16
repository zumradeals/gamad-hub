'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authPost } from '../../../../lib/api';

export default function CreerPageProPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', slug: '', tagline: '', description: '',
    category: '', email: '', country: '', city: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (field === 'name' && !form.slug) {
      setForm((p) => ({
        ...p,
        name: value,
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Le nom et le slug sont obligatoires');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const page = await authPost<{ slug: string }>('/portal/pages', form);
      router.push(`/zumara/pages/${page.slug}`);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la création');
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <Link href="/zumara/pages" style={{ fontSize: 13, color: '#1696D2', textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
          ← Retour aux Pages Pro
        </Link>

        <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 700, color: '#071326', margin: '0 0 4px' }}>
            Créer une Page Pro
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 28px' }}>
            Réservé aux fondateurs d'une Zumara ESTABLISHED. Une seule page par Zumara.
          </p>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
              padding: '12px 16px', marginBottom: 20, color: '#B91C1C', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field
              label="Nom de la Page *"
              value={form.name}
              onChange={(v) => handleChange('name', v)}
              placeholder="Ex: GAMAD Tech"
              maxLength={80}
            />
            <Field
              label="Slug (URL) *"
              value={form.slug}
              onChange={(v) => setForm((p) => ({ ...p, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
              placeholder="gamad-tech"
              maxLength={80}
              hint={`URL : /zumara/pages/${form.slug || 'votre-slug'}`}
            />
            <Field
              label="Accroche"
              value={form.tagline}
              onChange={(v) => handleChange('tagline', v)}
              placeholder="Une courte phrase qui définit votre page"
              maxLength={160}
            />
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Décrivez votre activité, vos services, votre mission…"
                maxLength={1000}
                rows={4}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #E5E7EB', fontSize: 14, resize: 'vertical',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <Field
              label="Catégorie"
              value={form.category}
              onChange={(v) => handleChange('category', v)}
              placeholder="tech, education, commerce…"
            />
            <Field
              label="Email de contact"
              value={form.email}
              onChange={(v) => handleChange('email', v)}
              placeholder="contact@exemple.com"
              type="email"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field
                label="Pays"
                value={form.country}
                onChange={(v) => handleChange('country', v)}
                placeholder="Cameroun"
              />
              <Field
                label="Ville"
                value={form.city}
                onChange={(v) => handleChange('city', v)}
                placeholder="Yaoundé"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#D1D5DB' : '#E5C100',
                color: '#071326', border: 'none', padding: '14px',
                borderRadius: 8, fontWeight: 700, fontSize: 16,
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
              }}
            >
              {loading ? 'Création en cours…' : 'Créer la Page Pro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, maxLength, hint, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number; hint?: string; type?: string;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 8,
          border: '1px solid #E5E7EB', fontSize: 14, outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {hint && <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>{hint}</p>}
    </div>
  );
}
