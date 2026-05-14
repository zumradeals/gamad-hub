'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

const REASONS = [
  { value: 'SPAM', label: 'Spam ou contenu répétitif' },
  { value: 'HATE_SPEECH', label: 'Discours haineux' },
  { value: 'MISINFORMATION', label: 'Désinformation' },
  { value: 'INAPPROPRIATE', label: 'Contenu inapproprié' },
  { value: 'OTHER', label: 'Autre' },
];

type Props = {
  contentId: string;
  contentType: 'feed' | 'blog';
};

export default function SignalButton({ contentId, contentType }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const token = localStorage.getItem('portal_token');
    if (!token) {
      setError('Connectez-vous pour signaler ce contenu.');
      return;
    }
    if (!reason) {
      setError('Choisissez une raison.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const endpoint = contentType === 'feed'
        ? `/api/v1/portal/feed/${contentId}/report`
        : `/api/v1/portal/blog/${contentId}/report`;
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, note: note.trim() || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Erreur lors du signalement');
      }
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <span style={{ fontSize: 12, color: '#0E9F4B' }}>
        ✓ Signalé
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          color: '#6B7280',
          padding: '4px 8px',
          borderRadius: 4,
        }}
        title="Signaler ce contenu"
      >
        ⚑ Signaler
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#071326' }}>
                Signaler ce contenu
              </h3>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
              Votre signalement sera examiné par nos modérateurs.
            </p>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#071326', display: 'block', marginBottom: 6 }}>
                Raison *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {REASONS.map(r => (
                  <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#071326', display: 'block', marginBottom: 6 }}>
                Précisions (optionnel)
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Décrivez le problème…"
                style={{
                  width: '100%',
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 14,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right' }}>{note.length}/500</div>
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#DC2626', margin: '0 0 12px' }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  fontSize: 14,
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                Annuler
              </button>
              <button
                onClick={submit}
                disabled={loading || !reason}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: loading || !reason ? '#9CA3AF' : '#DC2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading || !reason ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
