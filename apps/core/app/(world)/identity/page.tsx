'use client';
import { useEffect, useState, FormEvent } from 'react';
import { getCitizen, levelLabel, levelColor, levelBg, CitizenContext } from '../../../lib/citizen';
import { api } from '../../../lib/api';

export default function IdentityPage() {
  const [citizen, setCitizenState] = useState<CitizenContext | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [audits, setAudits] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const ctx = getCitizen();
    if (!ctx) return;
    setCitizenState(ctx);
    api.get<any>(`/profiles/${ctx.gamadId}`)
      .then(r => { setProfile(r); setDisplayName(r.profile?.displayName ?? ''); setBio(r.profile?.bio ?? ''); })
      .catch(() => {});
    api.get<any>('/audit/events?take=10')
      .then(r => setAudits(Array.isArray(r) ? r.slice(0, 10) : r.events?.slice(0, 10) ?? []))
      .catch(() => {});
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!citizen) return;
    setSaving(true);
    try {
      await api.patch(`/profiles/${citizen.gamadId}`, { displayName, bio });
      setSavedMsg('Profil mis à jour');
      setEditing(false);
      setTimeout(() => setSavedMsg(''), 3000);
    } catch {
      setSavedMsg('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  }

  if (!citizen) return null;

  return (
    <div style={{ maxWidth: 780 }}>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '0.375rem' }}>Mon Identité</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Votre existence numérique dans le monde GAMAD.
      </p>

      {/* GAMAD ID card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '2rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '2rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>GAMAD ID</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em' }}>
            {citizen.publicCode}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            padding: '0.3125rem 0.875rem',
            borderRadius: 6,
            background: levelBg(citizen.level),
            border: `1px solid ${levelColor(citizen.level)}50`,
            color: levelColor(citizen.level),
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            display: 'inline-block',
          }}>
            Niveau {citizen.level} — {levelLabel(citizen.level)}
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Profil public
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '0.3125rem 0.75rem',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 5,
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
              }}
            >
              Modifier
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Nom affiché">
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Bio courte">
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </Field>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={saving} style={primaryBtn}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setEditing(false)} style={secondaryBtn}>
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <Field label="Nom affiché">
              <span style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                {profile?.profile?.displayName ?? citizen.displayName}
              </span>
            </Field>
            <Field label="Email">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {profile?.account?.email ?? '—'}
              </span>
            </Field>
            {profile?.profile?.bio && (
              <Field label="Bio">
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {profile.profile.bio}
                </span>
              </Field>
            )}
          </div>
        )}
        {savedMsg && (
          <div style={{ marginTop: 10, color: 'var(--level-active)', fontSize: '0.8125rem' }}>{savedMsg}</div>
        )}
      </div>

      {/* Memberships */}
      {citizen.memberships?.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Structures d'appartenance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {citizen.memberships.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{m.unitName}</span>
                <span style={{
                  padding: '2px 8px',
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 4,
                  color: 'var(--accent)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                }}>
                  {m.roleName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit history */}
      {audits.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '1.5rem',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Historique récent
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {audits.map((e: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                  {e.action}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                  {new Date(e.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
};

const primaryBtn: React.CSSProperties = {
  padding: '0.5625rem 1.25rem',
  background: 'var(--accent)',
  color: '#0d1117',
  border: 'none',
  borderRadius: 6,
  fontSize: '0.875rem',
  fontWeight: 600,
};

const secondaryBtn: React.CSSProperties = {
  padding: '0.5625rem 1.25rem',
  background: 'transparent',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: '0.875rem',
};
