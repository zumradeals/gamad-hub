'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../../lib/api';

interface Stats {
  pendingPosts: number;
  pendingArticles: number;
  pendingReports: number;
  approvedToday: number;
  rejectedToday: number;
  approvalRate: number | null;
}

interface FilterRule {
  id: string;
  keyword: string;
  severity: 'FLAG' | 'BLOCK';
  createdAt: string;
  createdBy: string;
}

const SEVERITY_META = {
  FLAG:  { label: 'Signaler',  bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', desc: 'Contenu soumis à modération manuelle' },
  BLOCK: { label: 'Bloquer',   bg: 'rgba(239,68,68,0.15)',   color: '#f87171', desc: 'Contenu refusé automatiquement' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ModerationGovernancePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rules, setRules] = useState<FilterRule[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRules, setLoadingRules] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [rulesError, setRulesError] = useState('');

  /* new rule form */
  const [keyword, setKeyword] = useState('');
  const [severity, setSeverity] = useState<'FLAG' | 'BLOCK'>('FLAG');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  /* delete confirm */
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchStats = useCallback(() => {
    setLoadingStats(true);
    api.get<Stats>('/governance/moderation/stats')
      .then(setStats)
      .catch((e: any) => setStatsError(e.message ?? 'Erreur stats'))
      .finally(() => setLoadingStats(false));
  }, []);

  const fetchRules = useCallback(() => {
    setLoadingRules(true);
    api.get<FilterRule[]>('/governance/moderation/filter-rules')
      .then(setRules)
      .catch((e: any) => setRulesError(e.message ?? 'Erreur règles'))
      .finally(() => setLoadingRules(false));
  }, []);

  useEffect(() => { fetchStats(); fetchRules(); }, [fetchStats, fetchRules]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setAdding(true);
    setAddError('');
    setAddSuccess('');
    try {
      const rule = await api.post<FilterRule>('/governance/moderation/filter-rules', {
        keyword: keyword.trim().toLowerCase(),
        severity,
      });
      setRules(prev => [...prev, rule].sort((a, b) => a.keyword.localeCompare(b.keyword)));
      setKeyword('');
      setAddSuccess(`Règle "${rule.keyword}" ajoutée.`);
      fetchStats(); // refresh cache
    } catch (e: any) {
      setAddError(e.message ?? 'Erreur ajout');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/governance/moderation/filter-rules/${id}`);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      setRulesError(e.message ?? 'Erreur suppression');
    } finally {
      setDeletingId(null);
    }
  }

  const flagRules  = rules.filter(r => r.severity === 'FLAG');
  const blockRules = rules.filter(r => r.severity === 'BLOCK');

  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Gouvernance › Modules
        </div>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.375rem' }}>
          🛡 Modération — Tableau de bord
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Statistiques temps réel, règles de filtrage automatique du contenu (mots interdits / à signaler).
        </p>
      </div>

      {/* ── Stats ── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.875rem' }}>
          📊 Statistiques
        </h2>
        {statsError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem 1rem', color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {statsError}
          </div>
        )}
        {loadingStats ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Chargement…</p>
        ) : stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Posts en attente',     value: stats.pendingPosts,    icon: '📝', warn: stats.pendingPosts > 0 },
              { label: 'Articles en attente',  value: stats.pendingArticles, icon: '📰', warn: stats.pendingArticles > 0 },
              { label: 'Signalements',         value: stats.pendingReports,  icon: '⚑',  warn: stats.pendingReports > 0 },
              { label: 'Approuvés aujourd\'hui', value: stats.approvedToday, icon: '✅', warn: false },
              { label: 'Rejetés aujourd\'hui', value: stats.rejectedToday,   icon: '❌', warn: false },
              { label: 'Taux d\'approbation',  value: stats.approvalRate != null ? `${stats.approvalRate}%` : '—', icon: '📈', warn: false },
            ].map(s => (
              <div key={s.label} style={{
                background: s.warn ? 'rgba(245,158,11,0.08)' : 'var(--bg-card)',
                border: `1px solid ${s.warn ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                borderRadius: 12, padding: '1rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.warn ? '#f59e0b' : 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* ── Ajouter une règle ── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.875rem' }}>
          ➕ Ajouter une règle de filtrage
        </h2>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {(['FLAG', 'BLOCK'] as const).map(s => {
              const m = SEVERITY_META[s];
              return (
                <label
                  key={s}
                  style={{
                    flex: 1, minWidth: 180, display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                    padding: '0.875rem 1rem', borderRadius: 10, cursor: 'pointer',
                    border: `1px solid ${severity === s ? m.color : 'var(--border)'}`,
                    background: severity === s ? m.bg : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <input type="radio" name="severity" value={s} checked={severity === s} onChange={() => setSeverity(s)} style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: m.color, fontSize: '0.875rem' }}>{m.label}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.125rem' }}>{m.desc}</div>
                  </div>
                </label>
              );
            })}
          </div>

          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Mot ou expression à filtrer…"
              style={{
                flex: 1, minWidth: 200, background: 'var(--bg-input)', color: 'var(--text-primary)',
                border: '1px solid var(--border)', borderRadius: 6,
                padding: '0.5rem 0.875rem', fontSize: '0.875rem', outline: 'none',
                fontFamily: 'monospace',
              }}
            />
            <button
              type="submit"
              disabled={adding || !keyword.trim()}
              style={{
                background: adding || !keyword.trim() ? 'rgba(245,158,11,0.3)' : 'var(--accent)',
                color: '#000', border: 'none', borderRadius: 6,
                padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.875rem',
                cursor: adding || !keyword.trim() ? 'not-allowed' : 'pointer',
              }}
            >{adding ? '…' : 'Ajouter'}</button>
          </form>

          {addSuccess && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.875rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 6, color: '#34d399', fontSize: '0.8rem' }}>
              ✓ {addSuccess}
            </div>
          )}
          {addError && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.875rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: 'var(--danger)', fontSize: '0.8rem' }}>
              {addError}
            </div>
          )}
        </div>
      </section>

      {rulesError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem 1rem', color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {rulesError}
        </div>
      )}

      {/* ── Règles BLOCK ── */}
      <RuleSection
        title="🚫 Mots bloquants"
        subtitle="Contenu rejeté automatiquement sans modération manuelle"
        rules={blockRules}
        loading={loadingRules}
        color="#f87171"
        deletingId={deletingId}
        onDelete={handleDelete}
      />

      {/* ── Règles FLAG ── */}
      <RuleSection
        title="⚑ Mots à signaler"
        subtitle="Contenu soumis à la file de modération manuelle"
        rules={flagRules}
        loading={loadingRules}
        color="#f59e0b"
        deletingId={deletingId}
        onDelete={handleDelete}
      />
    </div>
  );
}

function RuleSection({ title, subtitle, rules, loading, color, deletingId, onDelete }: {
  title: string;
  subtitle: string;
  rules: FilterRule[];
  loading: boolean;
  color: string;
  deletingId: string | null;
  onDelete: (id: string) => void;
}) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '0.875rem' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.2rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{subtitle}</p>
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {loading ? 'Chargement…' : `${rules.length} règle${rules.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Chargement…</div>
        ) : rules.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Aucune règle dans cette catégorie.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '1rem 1.25rem' }}>
            {rules.map(r => (
              <div
                key={r.id}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  background: `${color}15`, border: `1px solid ${color}40`,
                  borderRadius: 20, padding: '0.25rem 0.5rem 0.25rem 0.875rem',
                  fontSize: '0.8125rem', color: color, fontFamily: 'monospace', fontWeight: 600,
                }}
                title={`Ajouté le ${formatDate(r.createdAt)}`}
              >
                {r.keyword}
                <button
                  onClick={() => onDelete(r.id)}
                  disabled={deletingId === r.id}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: color, fontSize: '0.75rem', opacity: deletingId === r.id ? 0.4 : 0.7,
                    lineHeight: 1, padding: '0 0.1rem',
                  }}
                  title="Supprimer"
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
