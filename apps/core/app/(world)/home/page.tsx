'use client';
import { useEffect, useState } from 'react';
import { getCitizen, levelLabel, levelColor, levelBg, CitizenContext } from '../../../lib/citizen';
import { api } from '../../../lib/api';

const STATUS_COLOR: Record<string, string> = {
  DRAFT: '#9ca3af',
  SUBMITTED: '#60a5fa',
  VALIDATED: '#34d399',
  IN_PROGRESS: '#f59e0b',
  COMPLETED: '#a78bfa',
  ARCHIVED: '#4b5563',
};

export default function HomePage() {
  const [citizen, setCitizenState] = useState<CitizenContext | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [zumaras, setZumaras] = useState<any[]>([]);

  useEffect(() => {
    const ctx = getCitizen();
    if (!ctx) return;
    setCitizenState(ctx);

    api.get<any>('/activities?take=3').then(r => setActivities(r.slice ? r.slice(0, 3) : [])).catch(() => {});
    api.get<any>('/communication/announcements?take=3').then(r => setAnnouncements(r.slice ? r.slice(0, 3) : [])).catch(() => {});
    api.get<any>('/communication/threads?take=3').then(r => setThreads(r.slice ? r.slice(0, 3) : [])).catch(() => {});
    api.get<any>('/portal/zumara/mine').then(r => setZumaras(Array.isArray(r) ? r.slice(0, 3) : [])).catch(() => {});
  }, []);

  if (!citizen) return null;

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Salutation */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Bienvenue, {citizen.displayName}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          {citizen.level === 1 && 'Votre accès est en cours de validation par les responsables.'}
          {citizen.level === 2 && 'Vous êtes citoyen actif du monde GAMAD.'}
          {citizen.level === 3 && 'Vous portez une responsabilité dans l\'organisation.'}
          {citizen.level >= 4 && 'Vous êtes membre du Haut Conseil de Gouvernance.'}
        </p>
      </div>

      {/* GAMAD ID */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Votre GAMAD ID
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', fontVariantNumeric: 'tabular-nums' }}>
            {citizen.publicCode}
          </div>
        </div>
        <div style={{
          padding: '0.3125rem 0.875rem',
          borderRadius: 6,
          background: levelBg(citizen.level),
          border: `1px solid ${levelColor(citizen.level)}50`,
          color: levelColor(citizen.level),
          fontSize: '0.8125rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
        }}>
          Niveau {citizen.level} — {levelLabel(citizen.level)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Zumara */}
        <Section title="Mes Zumara">
          {zumaras.length === 0 ? (
            <Empty>Aucune Zumara assignée</Empty>
          ) : (
            zumaras.map((z: any, i: number) => (
              <Row key={i}>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{z.cell?.name ?? z.name ?? '—'}</span>
                <Badge color="#a78bfa">{z.role ?? z.status ?? '—'}</Badge>
              </Row>
            ))
          )}
        </Section>

        {/* Activités */}
        <Section title="Activités en cours">
          {activities.length === 0 ? (
            <Empty>Aucune activité</Empty>
          ) : (
            activities.slice(0, 3).map((a: any) => (
              <Row key={a.id}>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', flex: 1 }}>{a.title}</span>
                <Badge color={STATUS_COLOR[a.status] ?? '#9ca3af'}>{a.status}</Badge>
              </Row>
            ))
          )}
        </Section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Annonces */}
        <Section title="Dernières annonces">
          {announcements.length === 0 ? (
            <Empty>Aucune annonce récente</Empty>
          ) : (
            announcements.slice(0, 3).map((a: any) => (
              <Row key={a.id}>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{a.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 2 }}>
                    {a.publisher?.profile?.displayName ?? '—'}
                  </div>
                </div>
              </Row>
            ))
          )}
        </Section>

        {/* Discussions */}
        <Section title="Discussions récentes">
          {threads.length === 0 ? (
            <Empty>Aucune discussion</Empty>
          ) : (
            threads.slice(0, 3).map((t: any) => (
              <Row key={t.id}>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{t.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 2 }}>
                    {t._count?.posts ?? 0} message{t._count?.posts !== 1 ? 's' : ''}
                  </div>
                </div>
                {t.isPinned && <Badge color="var(--accent)">Épinglé</Badge>}
              </Row>
            ))
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '1.25rem',
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      {children}
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      padding: '2px 7px',
      borderRadius: 4,
      fontSize: '0.6875rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      color,
      background: `${color}18`,
      border: `1px solid ${color}30`,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {children}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{children}</p>
  );
}
