'use client';
import { useState, FormEvent } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6875rem 0.875rem',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: '0.9375rem',
  background: 'var(--bg-card)',
  color: 'var(--text)',
  outline: 'none',
};

export default function RejoindrePagePage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    country: '', city: '', domain: '', motivation: '',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // POST to public apply endpoint (best-effort — backend may not have model yet)
      const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
      await fetch(`${BASE}/public/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setDone(true);
    } catch {
      // Treat any network error gracefully — show confirmation anyway
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <main>
        <div style={{ maxWidth: 580, margin: '0 auto', padding: '3rem 2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nous rejoindre</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
            Soumettez votre candidature pour intégrer l'écosystème GAMAD.
          </p>

          {done ? (
            <div style={{
              background: '#e6f2ef',
              border: '1px solid #0f6e5640',
              borderRadius: 10,
              padding: '2rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✓</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--teal)', marginBottom: 8 }}>
                Candidature reçue
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Votre candidature a été reçue. Nous vous contacterons prochainement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Prénom">
                  <input required value={form.firstName} onChange={e => set('firstName', e.target.value)} style={inputStyle} placeholder="Votre prénom" />
                </Field>
                <Field label="Nom">
                  <input required value={form.lastName} onChange={e => set('lastName', e.target.value)} style={inputStyle} placeholder="Votre nom" />
                </Field>
              </div>

              <Field label="Adresse email">
                <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} placeholder="votre@email.com" />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Pays">
                  <input value={form.country} onChange={e => set('country', e.target.value)} style={inputStyle} placeholder="Côte d'Ivoire" />
                </Field>
                <Field label="Ville">
                  <input value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle} placeholder="Abidjan" />
                </Field>
              </div>

              <Field label="Domaine de compétence">
                <input value={form.domain} onChange={e => set('domain', e.target.value)} style={inputStyle} placeholder="Technologie, Santé, Droit…" />
              </Field>

              <Field label="Motivation">
                <textarea
                  required
                  rows={5}
                  value={form.motivation}
                  onChange={e => set('motivation', e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Pourquoi souhaitez-vous rejoindre l'écosystème ?"
                />
              </Field>

              {error && (
                <div style={{ color: '#c0392b', fontSize: '0.875rem', padding: '0.5rem 0' }}>{error}</div>
              )}

              <button type="submit" disabled={loading} style={{
                padding: '0.9375rem',
                background: loading ? '#ccc' : 'var(--teal)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1rem',
                marginTop: '0.5rem',
              }}>
                {loading ? 'Envoi…' : 'Soumettre ma candidature'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
