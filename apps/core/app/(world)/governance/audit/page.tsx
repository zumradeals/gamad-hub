'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';

interface AuditEvent {
  id: string;
  action: string;
  actorId: string | null;
  targetId: string | null;
  targetType: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_COLOR: Record<string, string> = {
  CREATE:   '#34d399',
  UPDATE:   '#60a5fa',
  DELETE:   '#f87171',
  VALIDATE: '#a78bfa',
  SUSPEND:  '#fb923c',
  LOGIN:    '#94a3b8',
};

function actionColor(action: string): string {
  const key = Object.keys(ACTION_COLOR).find(k => action.toUpperCase().includes(k));
  return key ? ACTION_COLOR[key] : '#94a3b8';
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get<AuditEvent[]>('/audit/events')
      .then(setEvents)
      .catch(e => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        Journal d&apos;audit
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Traces immuables de toutes les actions critiques — append-only.
      </p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '1rem', color: '#f87171', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Chargement…</p>
      ) : events.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Aucun événement enregistré</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {events.map(ev => (
            <div key={ev.id}>
              <div
                onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '0.75rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  cursor: 'pointer', transition: 'border-color 0.15s',
                }}
              >
                {/* Action badge */}
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em',
                  padding: '2px 8px', borderRadius: 4, flexShrink: 0,
                  background: `${actionColor(ev.action)}20`,
                  border: `1px solid ${actionColor(ev.action)}40`,
                  color: actionColor(ev.action),
                  minWidth: 80, textAlign: 'center',
                }}>
                  {ev.action}
                </span>

                {/* Cible */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    {ev.targetType ?? 'système'}
                    {ev.targetId ? ` · ${ev.targetId.slice(0, 8)}…` : ''}
                  </span>
                  {ev.actorId && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                      par {ev.actorId.slice(0, 8)}…
                    </span>
                  )}
                </div>

                {/* Date */}
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', flexShrink: 0 }}>
                  {new Date(ev.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>

              {/* Metadata expanded */}
              {expanded === ev.id && ev.metadata && (
                <div style={{
                  background: '#0d1117', border: '1px solid var(--border)', borderTop: 'none',
                  borderRadius: '0 0 8px 8px', padding: '0.75rem 1rem',
                }}>
                  <pre style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0, overflow: 'auto' }}>
                    {JSON.stringify(ev.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
