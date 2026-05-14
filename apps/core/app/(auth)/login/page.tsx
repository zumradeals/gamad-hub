'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setCitizen } from '../../../lib/citizen';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

interface LoginResponse {
  token: string;
  citizen: {
    gamadId: string;
    publicCode: string;
    displayName: string;
    level: number;
    roles: string[];
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }

      const data: LoginResponse = await res.json();
      localStorage.setItem('gamadToken', data.token);
      setCitizen({
        gamadId:     data.citizen.gamadId,
        publicCode:  data.citizen.publicCode,
        displayName: data.citizen.displayName,
        level:       data.citizen.level,
        roles:       data.citizen.roles,
      });
      router.push('/home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0d1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: '2.5rem',
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: 12,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ color: '#d4a017', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.1em' }}>
            GAMAD HUB
          </span>
          <p style={{ color: '#8b949e', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Accès espace citoyen
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 6, padding: '0.625rem 0.875rem', marginBottom: '1rem',
            color: '#f87171', fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: '#8b949e', fontSize: '0.75rem', marginBottom: 4 }}>
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '0.625rem 0.875rem',
                background: '#0d1117', border: '1px solid #30363d',
                borderRadius: 6, color: '#e6edf3', fontSize: '0.875rem', outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#8b949e', fontSize: '0.75rem', marginBottom: 4 }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '0.625rem 0.875rem',
                background: '#0d1117', border: '1px solid #30363d',
                borderRadius: 6, color: '#e6edf3', fontSize: '0.875rem', outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: loading ? '#8b949e' : '#d4a017',
              color: '#0d1117',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? 'Connexion…' : 'Connexion'}
          </button>
        </form>
      </div>
    </main>
  );
}
