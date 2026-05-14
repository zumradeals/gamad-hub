'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { publicPost, setToken } from '../../lib/api';

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', country: '', city: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await publicPost('/portal/auth/register', form);
      // Auto-login après inscription
      const res = await publicPost<{ token: string; user: any }>('/portal/auth/login', {
        email: form.email,
        password: form.password,
      });
      setToken(res.token, res.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  return (
    <>
      <Nav />
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Créer un compte</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Accédez à l'écosystème GAMAD gratuitement.
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

              <div className="form-group">
                <label className="form-label">Adresse email</label>
                <input className="form-input" type="email" value={form.email} onChange={set('email')} required placeholder="jean@exemple.com" />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input className="form-input" type="password" value={form.password} onChange={set('password')} required placeholder="8 caractères minimum" minLength={8} />
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

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: 'var(--danger)', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.5rem' }}>
                {loading ? 'Création en cours…' : 'Créer mon compte'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
              Déjà un compte ?{' '}
              <Link href="/connexion" style={{ color: 'var(--blue)', fontWeight: 500 }}>
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
