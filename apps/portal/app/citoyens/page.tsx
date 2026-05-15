'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { publicGet } from '../../lib/api';

interface Citizen {
  publicCode: string;
  displayName: string;
  bio: string | null;
  country: string | null;
  city: string | null;
  trustLevel: string;
  reputationScore: number;
  zumara: { name: string; slug: string }[];
}

const trustColors: Record<string, string> = {
  NEWCOMER: '#8b949e',
  MEMBER: '#58a6ff',
  TRUSTED: '#3fb950',
  VETERAN: '#E5C100',
  GUARDIAN: '#f78166',
};

const trustLevels = ['', 'NEWCOMER', 'MEMBER', 'TRUSTED', 'VETERAN', 'GUARDIAN'];

export default function CitoyensPage() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('');
  const [trustLevel, setTrustLevel] = useState('');
  const [skip, setSkip] = useState(0);
  const take = 20;

  const load = useCallback((reset = false) => {
    setLoading(true);
    const s = reset ? 0 : skip;
    const params = new URLSearchParams({ skip: String(s), take: String(take) });
    if (country) params.set('country', country);
    if (trustLevel) params.set('trustLevel', trustLevel);
    publicGet<Citizen[]>(`/portal/profiles?${params}`)
      .then(data => {
        setCitizens(prev => reset ? data : [...prev, ...data]);
        if (reset) setSkip(0);
        setSkip(s + take);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [country, trustLevel, skip, take]);

  useEffect(() => { load(true); }, [country, trustLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem', color: '#e6edf3' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Annuaire des citoyens</h1>
        <p style={{ margin: '0.35rem 0 0', color: '#8b949e', fontSize: '0.875rem' }}>Découvrez les membres de la Nation GAMAD.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Pays (ex: Côte d'Ivoire)" style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '0.45rem 0.75rem', fontSize: '0.875rem', flex: 1, minWidth: 140 }} />
        <select value={trustLevel} onChange={e => setTrustLevel(e.target.value)} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '0.45rem 0.75rem', fontSize: '0.875rem' }}>
          {trustLevels.map(t => <option key={t} value={t}>{t || 'Tous niveaux'}</option>)}
        </select>
      </div>

      {/* Grid */}
      {citizens.length === 0 && !loading ? (
        <p style={{ color: '#8b949e', textAlign: 'center', padding: '3rem 0' }}>Aucun citoyen trouvé.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {citizens.map(c => {
            const tc = trustColors[c.trustLevel] ?? '#8b949e';
            return (
              <Link key={c.publicCode} href={`/profil/${c.publicCode}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '1.1rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#E5C100')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#30363d')}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E5C10022', border: '1.5px solid #E5C100', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#E5C100', flexShrink: 0 }}>
                      {c.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e6edf3' }}>{c.displayName}</div>
                      <span style={{ background: `${tc}22`, color: tc, borderRadius: 4, padding: '0.05rem 0.4rem', fontSize: '0.68rem', fontWeight: 700 }}>{c.trustLevel}</span>
                    </div>
                  </div>
                  {c.bio && <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#8b949e', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.bio}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#8b949e' }}>{c.city ? `${c.city}, ` : ''}{c.country ?? '—'}</span>
                    <span style={{ fontSize: '0.78rem', color: '#E5C100', fontFamily: 'monospace', fontWeight: 700 }}>{c.reputationScore} pts</span>
                  </div>
                  {c.zumara.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {c.zumara.map((z, i) => (
                        <span key={i} style={{ background: '#E5C10011', color: '#E5C100', borderRadius: 4, padding: '0.05rem 0.4rem', fontSize: '0.68rem' }}>⬡ {z.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {loading && <p style={{ color: '#8b949e', textAlign: 'center' }}>Chargement…</p>}

      {!loading && citizens.length >= skip && citizens.length > 0 && (
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => load(false)} style={{ background: '#161b22', border: '1px solid #30363d', color: '#e6edf3', borderRadius: 6, padding: '0.5rem 1.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
            Charger plus
          </button>
        </div>
      )}
    </div>
  );
}
