'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { publicGet } from '../../lib/api';

type ZumaraType = 'LOCAL' | 'DIGITAL' | 'HYBRID';
type ZumaraStatus = 'ACTIVE' | 'ESTABLISHED' | 'SATELLITE';

interface ZumaraCell {
  id: string;
  name: string;
  slug: string;
  objective: string;
  type: ZumaraType;
  country: string | null;
  city: string | null;
  status: ZumaraStatus;
  memberCount: number;
  cotisationAmount: number | null;
  cotisationPeriod: string | null;
}

const TYPE_LABEL: Record<ZumaraType, string> = { LOCAL: 'Locale', DIGITAL: 'Numérique', HYBRID: 'Hybride' };
const STATUS_COLOR: Record<ZumaraStatus, string> = { ACTIVE: '#0E9F4B', ESTABLISHED: '#E5C100', SATELLITE: '#1696D2' };

export default function ZumaraDirectoryPage() {
  const [cells, setCells] = useState<ZumaraCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [country, setCountry] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (type) qs.set('type', type);
      if (country) qs.set('country', country);
      const data = await publicGet<ZumaraCell[]>(`/portal/zumara?${qs.toString()}`);
      setCells(data);
    } catch { /* silence */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [type, country]);

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Annuaire des groupes
          </h1>
          <p style={{ color: '#6B7280', marginBottom: '1.25rem' }}>
            Rejoignez un groupe actif ou créez le vôtre.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
              <option value="">Tous les types</option>
              <option value="LOCAL">Locale</option>
              <option value="DIGITAL">Numérique</option>
              <option value="HYBRID">Hybride</option>
            </select>
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Pays…" style={inputStyle} />
            <Link href="/zumara/creer" style={{ marginLeft: 'auto', background: '#E5C100', color: '#071326', borderRadius: 8, padding: '0.6rem 1.25rem', fontWeight: 700, textDecoration: 'none' }}>
              + Créer un groupe
            </Link>
          </div>
        </div>

        {loading && <p style={{ color: '#9CA3AF' }}>Chargement…</p>}
        {!loading && cells.length === 0 && <p style={{ color: '#9CA3AF' }}>Aucun groupe trouvé.</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {cells.map((c) => (
            <Link key={c.id} href={`/zumara/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '1.25rem', transition: 'box-shadow 0.15s', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{c.name}</h3>
                  <span style={{ background: STATUS_COLOR[c.status] + '18', color: STATUS_COLOR[c.status], borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {c.status === 'ESTABLISHED' ? 'Établi' : c.status === 'SATELLITE' ? 'Satellite' : 'Actif'}
                  </span>
                </div>
                <p style={{ margin: '0 0 0.75rem', color: '#6B7280', fontSize: '0.85rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.objective}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#6B7280' }}>
                  <span>{TYPE_LABEL[c.type]}</span>
                  {c.country && <span>· {c.country}{c.city ? `, ${c.city}` : ''}</span>}
                  <span style={{ marginLeft: 'auto' }}>👥 {c.memberCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

const selectStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB', borderRadius: 8, padding: '0.5rem 0.75rem',
  fontSize: '0.875rem', color: '#374151', background: '#fff', cursor: 'pointer',
};
const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB', borderRadius: 8, padding: '0.5rem 0.75rem',
  fontSize: '0.875rem', color: '#374151', width: 160,
};
