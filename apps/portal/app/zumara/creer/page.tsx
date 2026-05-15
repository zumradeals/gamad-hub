'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { getToken, authPost } from '../../../lib/api';

type Step = 1 | 2 | 3;

export default function CreateZumaraPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({ name: '', objective: '', type: 'HYBRID', country: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (!getToken()) router.push('/connexion'); }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    if (form.objective.length < 50) { setError('L\'objectif doit faire au moins 50 caractères.'); return; }
    setLoading(true);
    setError('');
    try {
      await authPost('/portal/zumara/requests', form);
      router.push('/dashboard/zumara');
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de la soumission');
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = { border: '1px solid #E5E7EB', borderRadius: 8, padding: '0.65rem 0.9rem', width: '100%', fontSize: '0.9rem', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' };

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>Créer un groupe</h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Votre demande sera examinée avant toute mise en ligne.
        </p>

        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? '#E5C100' : '#E5E7EB' }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Informations de base</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Nom du groupe *</label>
              <input value={form.name} onChange={set('name')} style={inputStyle} placeholder="Ex: Artisans du Sahel" />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Type *</label>
              <select value={form.type} onChange={set('type')} style={inputStyle}>
                <option value="LOCAL">Local — ancré dans un territoire physique</option>
                <option value="DIGITAL">Numérique — opère entièrement en ligne</option>
                <option value="HYBRID">Hybride — les deux simultanément</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Pays *</label>
                <input value={form.country} onChange={set('country')} style={inputStyle} placeholder="Ex: Sénégal" />
              </div>
              <div>
                <label style={labelStyle}>Ville</label>
                <input value={form.city} onChange={set('city')} style={inputStyle} placeholder="Ex: Dakar" />
              </div>
            </div>
            <button
              onClick={() => { if (!form.name || form.name.length < 3) { setError('Nom trop court (min 3 chars)'); return; } if (!form.country) { setError('Pays requis'); return; } setError(''); setStep(2); }}
              style={{ background: '#071326', color: '#fff', border: 'none', borderRadius: 8, padding: '0.65rem 1.5rem', fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: '0.5rem' }}
            >
              Suivant →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Votre objectif</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Pourquoi créez-vous ce groupe ? * (min 50 caractères)</label>
              <textarea value={form.objective} onChange={set('objective')} rows={6} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Décrivez clairement votre mission, votre vision, ce que vous allez faire ensemble…" />
              <p style={{ fontSize: '0.75rem', color: form.objective.length < 50 ? '#EF4444' : '#0E9F4B', marginTop: '0.25rem' }}>
                {form.objective.length}/50 caractères minimum
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(1)} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8, padding: '0.65rem 1.25rem', fontWeight: 600, cursor: 'pointer' }}>← Retour</button>
              <button
                onClick={() => { if (form.objective.length < 50) { setError('Objectif trop court'); return; } setError(''); setStep(3); }}
                style={{ background: '#071326', color: '#fff', border: 'none', borderRadius: 8, padding: '0.65rem 1.5rem', fontWeight: 700, cursor: 'pointer', flex: 1 }}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Confirmation</h2>
            <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '1.25rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}><strong>Nom :</strong> {form.name}</p>
              <p style={{ margin: '0 0 0.5rem' }}><strong>Type :</strong> {form.type}</p>
              <p style={{ margin: '0 0 0.5rem' }}><strong>Lieu :</strong> {form.country}{form.city ? `, ${form.city}` : ''}</p>
              <p style={{ margin: 0 }}><strong>Objectif :</strong> {form.objective}</p>
            </div>
            <div style={{ background: '#FEF3C7', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#92400E' }}>
              ℹ️ Votre demande sera examinée. Vous serez notifié(e) de la décision.
              Si validée, vous aurez un délai pour recruter 4 co-fondateurs.
            </div>
            {error && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(2)} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8, padding: '0.65rem 1.25rem', fontWeight: 600, cursor: 'pointer' }}>← Retour</button>
              <button onClick={submit} disabled={loading} style={{ background: '#E5C100', color: '#071326', border: 'none', borderRadius: 8, padding: '0.65rem 1.5rem', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', flex: 1 }}>
                {loading ? 'Envoi en cours…' : 'Soumettre la demande'}
              </button>
            </div>
          </div>
        )}

        {error && step !== 3 && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.75rem' }}>{error}</p>}
      </main>
      <Footer />
    </>
  );
}
