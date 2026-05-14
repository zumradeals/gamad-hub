'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { publicPost, setToken } from '../../lib/api';

export default function ConnexionPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await publicPost<{ token: string; user: any }>('/portal/auth/login', form);
      setToken(res.token, res.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Connexion</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Accédez à votre espace GAMAD.
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Adresse email</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="jean@exemple.com"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: 'var(--danger)', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
              Pas encore de compte ?{' '}
              <Link href="/inscription" style={{ color: 'var(--blue)', fontWeight: 500 }}>
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
