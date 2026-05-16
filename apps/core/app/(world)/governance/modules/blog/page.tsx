'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../../../lib/api';

/* ── types ── */
interface ConfigEntry {
  key: string;
  value: string;
  updatedBy: string;
  updatedAt: string;
}

interface ModuleRole {
  id: string;
  gamadId: string;
  role: string;
  grantedBy: string;
  active: boolean;
  createdAt: string;
}

/* ── meta pour chaque clé de config ── */
const CONFIG_META: Record<string, { label: string; description: string; type: 'number' | 'bool' | 'string' | 'select'; options?: string[] }> = {
  reader_reward_amount:  { label: 'Récompense lecteur (Z)',         description: 'ZAHAB crédité au lecteur à la première lecture d\'un article',       type: 'number' },
  author_publish_reward: { label: 'Récompense publication (Z)',     description: 'ZAHAB crédité à l\'auteur quand son article est approuvé',            type: 'number' },
  milestone_100_reward:  { label: 'Milestone 100 vues (Z)',         description: 'Bonus auteur atteint à 100 vues',                                      type: 'number' },
  milestone_1k_reward:   { label: 'Milestone 1 000 vues (Z)',       description: 'Bonus auteur atteint à 1 000 vues',                                    type: 'number' },
  like_reward_author:    { label: 'Récompense like auteur (Z)',     description: 'ZAHAB crédité à l\'auteur quand un lecteur aime son article',          type: 'number' },
  comment_reward:        { label: 'Récompense commentaire (Z)',     description: 'ZAHAB crédité à l\'auteur d\'un commentaire',                          type: 'number' },
  min_trust_to_write:    { label: 'Niveau min pour écrire',         description: 'Niveau de réputation minimum requis pour créer un article',            type: 'select', options: ['NEWCOMER', 'MEMBER', 'TRUSTED', 'VETERAN', 'GUARDIAN'] },
  auto_moderation:       { label: 'Auto-approbation activée',       description: 'Si actif, les auteurs TRUSTED+ publient sans passer par la rédaction', type: 'bool' },
};

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  EDITOR:    { bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  MODERATOR: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── composant édition d'une config ── */
function ConfigRow({ entry, onSave }: {
  entry: ConfigEntry;
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const meta = CONFIG_META[entry.key];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await onSave(entry.key, draft);
      setEditing(false);
    } catch (e: any) {
      setError(e.message ?? 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(entry.value);
    setEditing(false);
    setError('');
  }

  const displayValue = () => {
    if (meta?.type === 'bool') return entry.value === 'true' ? '✅ Activé' : '❌ Désactivé';
    if (meta?.type === 'number') return `${entry.value} Z`;
    return entry.value;
  };

  return (
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{meta?.label ?? entry.key}</span>
          <code style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{entry.key}</code>
        </div>
        {meta?.description && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', lineHeight: 1.5 }}>{meta.description}</p>
        )}

        {editing ? (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {meta?.type === 'bool' ? (
              <select
                value={draft}
                onChange={e => setDraft(e.target.value)}
                style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.375rem 0.625rem', fontSize: '0.875rem' }}
              >
                <option value="true">Activé</option>
                <option value="false">Désactivé</option>
              </select>
            ) : meta?.type === 'select' ? (
              <select
                value={draft}
                onChange={e => setDraft(e.target.value)}
                style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.375rem 0.625rem', fontSize: '0.875rem' }}
              >
                {meta.options!.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type="number"
                step="0.1"
                min="0"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.375rem 0.625rem', fontSize: '0.875rem', width: 120 }}
              />
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '0.375rem 0.875rem', fontWeight: 700, fontSize: '0.8rem', opacity: saving ? 0.7 : 1 }}
            >{saving ? '…' : 'Enregistrer'}</button>
            <button onClick={handleCancel} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>
              Annuler
            </button>
            {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{error}</span>}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{displayValue()}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>· modifié le {formatDate(entry.updatedAt)}</span>
          </div>
        )}
      </div>

      {!editing && (
        <button
          onClick={() => { setDraft(entry.value); setEditing(true); }}
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.375rem 0.75rem', fontSize: '0.8rem', flexShrink: 0, whiteSpace: 'nowrap' }}
        >Modifier</button>
      )}
    </div>
  );
}

/* ── page principale ── */
export default function BlogGovernancePage() {
  const [config, setConfig] = useState<ConfigEntry[]>([]);
  const [roles, setRoles] = useState<ModuleRole[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [configError, setConfigError] = useState('');
  const [rolesError, setRolesError] = useState('');

  /* grant role form */
  const [newGamadId, setNewGamadId] = useState('');
  const [newRole, setNewRole] = useState<'EDITOR' | 'MODERATOR'>('EDITOR');
  const [granting, setGranting] = useState(false);
  const [grantError, setGrantError] = useState('');
  const [grantSuccess, setGrantSuccess] = useState('');

  /* ── fetch ── */
  const fetchConfig = useCallback(() => {
    setLoadingConfig(true);
    api.get<ConfigEntry[]>('/governance/modules/blog/config')
      .then(setConfig)
      .catch(e => setConfigError(e.message ?? 'Erreur chargement config'))
      .finally(() => setLoadingConfig(false));
  }, []);

  const fetchRoles = useCallback(() => {
    setLoadingRoles(true);
    api.get<ModuleRole[]>('/governance/modules/blog/roles')
      .then(setRoles)
      .catch(e => setRolesError(e.message ?? 'Erreur chargement rôles'))
      .finally(() => setLoadingRoles(false));
  }, []);

  useEffect(() => { fetchConfig(); fetchRoles(); }, [fetchConfig, fetchRoles]);

  /* ── save config ── */
  async function handleSaveConfig(key: string, value: string) {
    await api.post(`/governance/modules/blog/config/${key}`, { value });
    setConfig(prev => prev.map(c => c.key === key ? { ...c, value, updatedAt: new Date().toISOString() } : c));
  }

  /* ── grant role ── */
  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    if (!newGamadId.trim()) return;
    setGranting(true);
    setGrantError('');
    setGrantSuccess('');
    try {
      await api.post('/governance/modules/blog/roles', { gamadId: newGamadId.trim(), role: newRole });
      setGrantSuccess(`Rôle ${newRole} accordé à ${newGamadId.trim()}`);
      setNewGamadId('');
      fetchRoles();
    } catch (e: any) {
      setGrantError(e.message ?? 'Erreur');
    } finally {
      setGranting(false);
    }
  }

  /* ── revoke role ── */
  async function handleRevoke(gamadId: string, role: string) {
    try {
      await api.delete(`/governance/modules/blog/roles/${gamadId}/${role}`);
      setRoles(prev => prev.filter(r => !(r.gamadId === gamadId && r.role === role)));
    } catch (e: any) {
      setRolesError(e.message ?? 'Erreur révocation');
    }
  }

  /* ── group config by section ── */
  const zahabKeys = ['reader_reward_amount', 'author_publish_reward', 'milestone_100_reward', 'milestone_1k_reward', 'like_reward_author', 'comment_reward'];
  const editoKeys = ['min_trust_to_write', 'auto_moderation'];

  const zahabConfig = config.filter(c => zahabKeys.includes(c.key));
  const editoConfig = config.filter(c => editoKeys.includes(c.key));
  const otherConfig = config.filter(c => !zahabKeys.includes(c.key) && !editoKeys.includes(c.key));

  const activeRoles = roles.filter(r => r.active);

  /* ── render ── */
  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Gouvernance › Modules
        </div>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.375rem' }}>
          📰 GAMAD Blog — Configuration souveraine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Paramètres ZAHAB, seuils éditoriaux et attribution des rôles Éditeur / Modérateur.
          Toutes les modifications prennent effet immédiatement.
        </p>
      </div>

      {configError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.875rem 1rem', color: 'var(--danger)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {configError}
        </div>
      )}

      {/* ── Section ZAHAB ── */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
          <span style={{ fontSize: '1.125rem' }}>📿</span>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.0625rem', fontWeight: 600 }}>Récompenses ZAHAB</h2>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {loadingConfig ? (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.875rem' }}>Chargement…</div>
          ) : zahabConfig.length === 0 ? (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.875rem' }}>
              Aucun paramètre ZAHAB — les valeurs par défaut sont actives.
            </div>
          ) : (
            zahabConfig.map(entry => (
              <ConfigRow key={entry.key} entry={entry} onSave={handleSaveConfig} />
            ))
          )}
        </div>
      </section>

      {/* ── Section Éditorial ── */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
          <span style={{ fontSize: '1.125rem' }}>🖊</span>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.0625rem', fontWeight: 600 }}>Paramètres éditoriaux</h2>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {loadingConfig ? (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.875rem' }}>Chargement…</div>
          ) : editoConfig.length === 0 ? (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.875rem' }}>
              Paramètres éditoriaux aux valeurs par défaut.
            </div>
          ) : (
            editoConfig.map(entry => (
              <ConfigRow key={entry.key} entry={entry} onSave={handleSaveConfig} />
            ))
          )}
        </div>
        <p style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '0.25rem' }}>
          ℹ️ Les paramètres non encore modifiés utilisent les valeurs par défaut du système. Ils apparaîtront ici après leur première modification.
        </p>
      </section>

      {/* ── Section autres config ── */}
      {otherConfig.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.875rem' }}>Autres paramètres</h2>
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {otherConfig.map(entry => (
              <ConfigRow key={entry.key} entry={entry} onSave={handleSaveConfig} />
            ))}
          </div>
        </section>
      )}

      {/* ── Section Rôles ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
          <span style={{ fontSize: '1.125rem' }}>👥</span>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.0625rem', fontWeight: 600 }}>Rôles éditoriaux</h2>
        </div>

        {/* Formulaire d'attribution */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Attribuer un rôle</h3>
          <form onSubmit={handleGrant} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.375rem', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                GAMAD ID
              </label>
              <input
                type="text"
                value={newGamadId}
                onChange={e => setNewGamadId(e.target.value)}
                placeholder="GMD-XXXXXXXX"
                style={{
                  width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)',
                  border: '1px solid var(--border)', borderRadius: 6,
                  padding: '0.5rem 0.875rem', fontSize: '0.875rem', outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.375rem', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                Rôle
              </label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as 'EDITOR' | 'MODERATOR')}
                style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
              >
                <option value="EDITOR">EDITOR — accès salle de rédaction</option>
                <option value="MODERATOR">MODERATOR — modération contenu</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={granting || !newGamadId.trim()}
              style={{
                background: granting || !newGamadId.trim() ? 'rgba(245,158,11,0.3)' : 'var(--accent)',
                color: '#000', border: 'none', borderRadius: 6,
                padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.875rem',
                cursor: granting || !newGamadId.trim() ? 'not-allowed' : 'pointer',
              }}
            >{granting ? '…' : 'Attribuer'}</button>
          </form>

          {grantSuccess && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.875rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 6, color: '#34d399', fontSize: '0.8rem' }}>
              ✓ {grantSuccess}
            </div>
          )}
          {grantError && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.875rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: 'var(--danger)', fontSize: '0.8rem' }}>
              {grantError}
            </div>
          )}
        </div>

        {/* Liste des rôles actifs */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Membres avec rôle actif</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{activeRoles.length} membre{activeRoles.length !== 1 ? 's' : ''}</span>
          </div>

          {rolesError && (
            <div style={{ padding: '1rem', color: 'var(--danger)', fontSize: '0.875rem' }}>{rolesError}</div>
          )}

          {loadingRoles ? (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.875rem' }}>Chargement…</div>
          ) : activeRoles.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Aucun rôle éditorial attribué.</p>
            </div>
          ) : (
            activeRoles.map(r => {
              const rc = ROLE_COLORS[r.role] ?? { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' };
              return (
                <div key={r.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <code style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>{r.gamadId}</code>
                      <span style={{ background: rc.bg, color: rc.color, fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, letterSpacing: '0.05em' }}>
                        {r.role}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Accordé le {formatDate(r.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(r.gamadId, r.role)}
                    style={{
                      background: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
                      border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6,
                      padding: '0.375rem 0.75rem', fontSize: '0.8rem', fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >Révoquer</button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
