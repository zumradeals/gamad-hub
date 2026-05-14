'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { setCitizen } from '../../../lib/citizen';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ token: string; citizen: any }>('/auth/login', { email, password });
      localStorage.setItem('gamadToken', res.token);
      setCitizen(res.citizen);
      router.push('/home');
    } catch (err: any) {
      setError(err.message ?? 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: '2.5rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            color: 'var(--accent)',
            fontWeight: 700,
            fontSize: '1.75rem',
            letterSpacing: '0.12em',
            marginBottom: '0.5rem',
          }}>
            GAMAD
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            Espace souverain des citoyens
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 500,
              marginBottom: 6,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="citoyen@gamad.net"
              style={{
                width: '100%',
                padding: '0.6875rem 0.875rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 500,
              marginBottom: 6,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••••"
              style={{
                width: '100%',
                padding: '0.6875rem 0.875rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '0.625rem 0.875rem',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 6,
              color: 'var(--danger)',
              fontSize: '0.8125rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.25rem',
              padding: '0.8125rem',
              background: loading ? 'var(--border)' : 'var(--accent)',
              color: loading ? 'var(--text-secondary)' : '#0d1117',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: '0.02em',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Vérification…' : 'Entrer dans l\'espace'}
          </button>
        </form>

        <p style={{
          marginTop: '1.75rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
        }}>
          Pas encore citoyen ?{' '}
          <a
            href={process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://gamad.net/rejoindre'}
            style={{ color: 'var(--accent)' }}
          >
            Rejoindre GAMAD
          </a>
        </p>
      </div>
    </main>
  );
}
