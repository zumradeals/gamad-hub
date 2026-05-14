'use client';
import { useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { authPost, publicPost, getToken } from '../../lib/api';
import Link from 'next/link';

export default function RejoindreePage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', country: '', city: '', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const isLoggedIn = typeof window !== 'undefined' && !!getToken();

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authPost('/portal/auth/apply', form);
      setDone(true);
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <>
        <Nav />
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤝</div>
            <h2 style={{ fontSize: '1.375rem', marginBottom: '0.75rem' }}>Créez un compte d'abord</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1.75rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Pour soumettre une candidature, vous devez avoir un compte sur la plateforme.
              L'inscription est gratuite et instantanée.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link href="/inscription" className="btn btn-primary">Créer un compte</Link>
              <Link href="/connexion" className="btn btn-outline">Se connecter</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          {done ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
              <h2 style={{ fontSize: '1.375rem', marginBottom: '0.75rem', color: 'var(--green)' }}>
                Demande reçue
              </h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.9375rem' }}>
                Votre demande a bien été enregistrée. Nous reviendrons vers vous prochainement.
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Rejoindre le Réseau</h1>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  Remplissez ce formulaire pour exprimer votre intérêt. Nous reviendrons vers vous
                  si votre profil correspond à nos besoins actuels.
                </p>
              </div>

              <div className="card">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Prénom</label>
                      <input className="form-input" value={form.firstName} onChange={set('firstName')} required placeholder="Jean" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nom</label>
                      <input className="form-input" value={form.lastName} onChange={set('lastName')} required placeholder="Dupont" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Pays <span style={{ color: 'var(--muted)' }}>(optionnel)</span></label>
                      <input className="form-input" value={form.country} onChange={set('country')} placeholder="France" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ville <span style={{ color: 'var(--muted)' }}>(optionnel)</span></label>
                      <input className="form-input" value={form.city} onChange={set('city')} placeholder="Paris" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Votre message <span style={{ color: 'var(--muted)' }}>(optionnel)</span>
                    </label>
                    <textarea
                      className="form-input form-textarea"
                      value={form.message}
                      onChange={set('message')}
                      placeholder="Quelque chose à partager avec nous ?"
                      maxLength={1000}
                    />
                  </div>

                  {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.75rem', color: 'var(--danger)', fontSize: '0.875rem' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.25rem' }}>
                    {loading ? 'Envoi…' : 'Soumettre ma candidature'}
                  </button>
                </form>
              </div>

              <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--muted)', fontSize: '0.8125rem', lineHeight: 1.7 }}>
                Ces informations sont traitées de manière confidentielle.
                Nous ne partageons aucune donnée sans votre consentement.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
