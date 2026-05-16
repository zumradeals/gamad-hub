'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../../../lib/api';

interface ConfigEntry {
  value: string;
  isDefault: boolean;
}

interface ConfigMap {
  [key: string]: ConfigEntry;
}

interface Role {
  module: string;
  gamadId: string;
  role: string;
  grantedBy: string;
  createdAt: string;
  active: boolean;
  gamad: {
    publicCode: string;
    profile?: { displayName?: string; avatarUrl?: string };
  };
}

const CONFIG_META: Record<string, { label: string; desc: string; unit?: string }> = {
  watch_reward_viewer:   { label: 'Récompense visionnage (spectateur)', desc: 'ZAHAB crédité au spectateur par vidéo regardée', unit: 'Z' },
  like_reward_viewer:    { label: 'Récompense like (spectateur)',       desc: 'ZAHAB crédité au spectateur par like donné', unit: 'Z' },
  like_reward_author:    { label: 'Récompense like (auteur)',           desc: 'ZAHAB crédité à l\'auteur par like reçu', unit: 'Z' },
  publish_reward:        { label: 'Récompense publication',             desc: 'ZAHAB crédité à l\'auteur à la publication', unit: 'Z' },
  milestone_100_reward:  { label: 'Palier 100 vues',                   desc: 'Bonus ZAHAB à 100 vues', unit: 'Z' },
  milestone_1k_reward:   { label: 'Palier 1 000 vues',                 desc: 'Bonus ZAHAB à 1 000 vues', unit: 'Z' },
  milestone_10k_reward:  { label: 'Palier 10 000 vues',                desc: 'Bonus ZAHAB à 10 000 vues', unit: 'Z' },
  comment_reward:        { label: 'Récompense commentaire',             desc: 'ZAHAB crédité par commentaire posté', unit: 'Z' },
  min_trust_to_publish:  { label: 'Niveau minimum pour publier',       desc: 'TrustLevel requis pour soumettre une vidéo' },
  auto_moderation:       { label: 'Auto-publication (TRUSTED+)',        desc: 'true = les membres TRUSTED+ publient sans modération manuelle' },
};

const ZAHAB_KEYS = ['watch_reward_viewer','like_reward_viewer','like_reward_author','publish_reward','milestone_100_reward','milestone_1k_reward','milestone_10k_reward','comment_reward'];
const PARAMS_KEYS = ['min_trust_to_publish', 'auto_moderation'];

function ConfigRow({ configKey, entry, onSave }: {
  configKey: string;
  entry: ConfigEntry;
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const meta = CONFIG_META[configKey];
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(entry.value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await onSave(configKey, val);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem',
      alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: 2 }}>
          {meta?.label ?? configKey}
          {entry.isDefault && (
            <span style={{ marginLeft: 6, fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>défaut</span>
          )}
          {saved && (
            <span style={{ marginLeft: 8, fontSize: '0.75rem', color: '#34d399' }}>✓ Sauvegardé</span>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{meta?.desc}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {editing ? (
          <>
            <input
              value={val}
              onChange={e => setVal(e.target.value)}
              style={{
                width: 120, padding: '0.375rem 0.625rem', background: 'var(--bg-input)',
                border: '1px solid var(--accent)', borderRadius: 6, color: 'var(--text-primary)',
                fontSize: '0.875rem', fontFamily: 'monospace',
              }}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setEditing(false); setVal(entry.value); } }}
            />
            {meta?.unit && <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{meta.unit}</span>}
            <button onClick={save} disabled={saving} style={{
              background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6,
              padding: '0.375rem 0.75rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer',
            }}>
              {saving ? '…' : '✓'}
            </button>
            <button onClick={() => { setEditing(false); setVal(entry.value); }} style={{
              background: 'transparent', border: '1px solid var(--border)', borderRadius: 6,
              padding: '0.375rem 0.625rem', fontSize: '0.8125rem', cursor: 'pointer', color: 'var(--text-secondary)',
            }}>
              ✕
            </button>
          </>
        ) : (
          <>
            <span style={{
              fontFamily: 'monospace', fontSize: '0.9375rem', fontWeight: 700,
              color: 'var(--accent)', padding: '0.25rem 0.625rem',
              background: 'rgba(212,160,23,0.1)', borderRadius: 6,
            }}>
              {entry.value}{meta?.unit ? ` ${meta.unit}` : ''}
            </span>
            <button onClick={() => setEditing(true)} style={{
              background: 'transparent', border: '1px solid var(--border)', borderRadius: 6,
              padding: '0.25rem 0.625rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)',
            }}>
              Modifier
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VideoTubeConfigPage() {
  const [config, setConfig] = useState<ConfigMap>({});
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState('');

  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState('');

  const [newRoleId, setNewRoleId] = useState('');
  const [newRoleType, setNewRoleType] = useState('EDITOR');
  const [grantingRole, setGrantingRole] = useState(false);
  const [roleMsg, setRoleMsg] = useState('');

  const fetchConfig = useCallback(() => {
    setLoadingConfig(true);
    api.get<ConfigMap>('/governance/modules/videotube/config')
      .then(setConfig)
      .catch((e: any) => setConfigError(e.message ?? 'Erreur'))
      .finally(() => setLoadingConfig(false));
  }, []);

  const fetchRoles = useCallback(() => {
    setLoadingRoles(true);
    api.get<Role[]>('/governance/modules/videotube/roles')
      .then(setRoles)
      .catch((e: any) => setRolesError(e.message ?? 'Erreur'))
      .finally(() => setLoadingRoles(false));
  }, []);

  useEffect(() => { fetchConfig(); fetchRoles(); }, [fetchConfig, fetchRoles]);

  async function saveConfig(key: string, value: string) {
    await api.post('/governance/modules/videotube/config', { key, value });
    setConfig(prev => ({ ...prev, [key]: { value, isDefault: false } }));
  }

  async function grantRole() {
    if (!newRoleId.trim()) return;
    setGrantingRole(true);
    setRoleMsg('');
    try {
      await api.post('/governance/modules/videotube/roles', {
        gamadId: newRoleId.trim(),
        role: newRoleType,
      });
      setRoleMsg(`Rôle ${newRoleType} accordé.`);
      setNewRoleId('');
      fetchRoles();
    } catch (e: any) {
      setRoleMsg(e.message ?? 'Erreur');
    } finally {
      setGrantingRole(false);
    }
  }

  async function revokeRole(gamadId: string, role: string) {
    try {
      await api.delete(`/governance/modules/videotube/roles/${gamadId}/${role}`);
      setRoles(prev => prev.filter(r => !(r.gamadId === gamadId && r.role === role)));
    } catch {}
  }

  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Gouvernance › Modules
        </div>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.375rem' }}>
          🎬 GamadTube — Configuration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Paramètres de la plateforme vidéo, récompenses ZAHAB et rôles éditoriaux.
        </p>
      </div>

      {configError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem 1rem', color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {configError}
        </div>
      )}

      {/* ── ZAHAB Rewards ── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.875rem' }}>
          💰 Récompenses ZAHAB
        </h2>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: '0 1.25rem' }}>
          {loadingConfig ? (
            <p style={{ color: 'var(--text-secondary)', padding: '1rem 0', fontSize: '0.875rem' }}>Chargement…</p>
          ) : (
            ZAHAB_KEYS.map(k => config[k] && (
              <ConfigRow key={k} configKey={k} entry={config[k]} onSave={saveConfig} />
            ))
          )}
        </div>
      </section>

      {/* ── Paramètres éditoriaux ── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.875rem' }}>
          ⚙️ Paramètres éditoriaux
        </h2>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: '0 1.25rem' }}>
          {loadingConfig ? (
            <p style={{ color: 'var(--text-secondary)', padding: '1rem 0', fontSize: '0.875rem' }}>Chargement…</p>
          ) : (
            PARAMS_KEYS.map(k => config[k] && (
              <ConfigRow key={k} configKey={k} entry={config[k]} onSave={saveConfig} />
            ))
          )}
        </div>
      </section>

      {/* ── Rôles ── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.875rem' }}>
          👤 Rôles — Éditeurs & Modérateurs
        </h2>

        {rolesError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem 1rem', color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {rolesError}
          </div>
        )}

        {/* Accorder un rôle */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>Accorder un rôle</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              value={newRoleId}
              onChange={e => setNewRoleId(e.target.value)}
              placeholder="GAMAD ID…"
              style={{
                flex: 1, minWidth: 200, padding: '0.5rem 0.875rem',
                background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 6,
                color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'monospace',
              }}
            />
            <select
              value={newRoleType}
              onChange={e => setNewRoleType(e.target.value)}
              style={{
                padding: '0.5rem 0.875rem', background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.875rem',
              }}
            >
              <option value="EDITOR">EDITOR</option>
              <option value="MODERATOR">MODERATOR</option>
            </select>
            <button
              onClick={grantRole}
              disabled={grantingRole || !newRoleId.trim()}
              style={{
                background: grantingRole || !newRoleId.trim() ? 'rgba(212,160,23,0.3)' : 'var(--accent)',
                color: '#000', border: 'none', borderRadius: 6,
                padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.875rem',
                cursor: grantingRole || !newRoleId.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {grantingRole ? '…' : 'Accorder'}
            </button>
          </div>
          {roleMsg && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: roleMsg.includes('Erreur') ? 'var(--danger)' : '#34d399' }}>
              {roleMsg}
            </p>
          )}
        </div>

        {/* Liste des rôles */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {loadingRoles ? 'Chargement…' : `${roles.length} rôle${roles.length !== 1 ? 's' : ''} actif${roles.length !== 1 ? 's' : ''}`}
            </span>
          </div>
          {loadingRoles ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Chargement…</div>
          ) : roles.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Aucun rôle accordé.</p>
            </div>
          ) : (
            <div>
              {roles.map(r => (
                <div key={`${r.gamadId}-${r.role}`} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'rgba(212,160,23,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0,
                  }}>
                    {r.gamad.publicCode.slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                      {r.gamad.profile?.displayName ?? r.gamad.publicCode}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.gamad.publicCode}</div>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.625rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700,
                    background: r.role === 'EDITOR' ? 'rgba(22,150,210,0.15)' : 'rgba(167,139,250,0.15)',
                    color: r.role === 'EDITOR' ? '#1696D2' : '#a78bfa',
                  }}>
                    {r.role}
                  </span>
                  <button
                    onClick={() => revokeRole(r.gamadId, r.role)}
                    style={{
                      background: 'transparent', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '0.25rem 0.625rem',
                      color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem',
                    }}
                  >
                    Révoquer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
