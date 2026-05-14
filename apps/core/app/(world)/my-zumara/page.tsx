'use client';
import { useEffect, useState } from 'react';
import { getCitizen, CitizenContext } from '../../../lib/citizen';
import { api } from '../../../lib/api';

export default function MyZumaraPage() {
  const [citizen, setCitizenState] = useState<CitizenContext | null>(null);
  const [zumara, setZumara] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctx = getCitizen();
    if (!ctx) return;
    setCitizenState(ctx);

    // Find the member's Zumara unit from their memberships
    const zumaraUnit = ctx.memberships?.find(m =>
      m.unitName?.toLowerCase().includes('zumara') || m.roleName?.toLowerCase().includes('zumara')
    );

    if (!zumaraUnit) { setLoading(false); return; }

    const uid = zumaraUnit.unitId;
    Promise.all([
      api.get<any>(`/organization/units/${uid}`),
      api.get<any>(`/activities?unitId=${uid}&take=5`),
      api.get<any>(`/documents?unitId=${uid}&take=5`),
      api.get<any>(`/communication/threads?unitId=${uid}&visibility=PRIVATE&take=5`),
      api.get<any>(`/communication/announcements?unitId=${uid}&take=3`),
    ]).then(([unit, acts, docs, thr, ann]) => {
      setZumara(unit);
      setMembers(unit.memberships ?? []);
      setActivities(Array.isArray(acts) ? acts : []);
      setDocuments(Array.isArray(docs) ? docs : []);
      setThreads(Array.isArray(thr) ? thr : []);
      setAnnouncements(Array.isArray(ann) ? ann : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!citizen) return null;
  if (loading) return <Loader />;

  if (!zumara) {
    return (
      <div style={{ maxWidth: 600 }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '0.375rem' }}>Ma Zumara</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Votre cellule d'action, de transmission et d'évolution.
        </p>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>◉</div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: 8 }}>
            Vous n'êtes pas encore rattaché à une Zumara
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 400, margin: '0 auto' }}>
            Une Zumara est une cellule de vie et d'action au sein du monde GAMAD.
            Elle réunit des citoyens autour d'une mission commune.
            Un responsable de structure vous y assignera après validation.
          </p>
        </div>
      </div>
    );
  }

  const classificationColor: Record<string, string> = {
    PUBLIC: 'var(--level-active)',
    INTERNAL: 'var(--level-pending)',
    CONFIDENTIAL: 'var(--level-responsable)',
    STRATEGIC: 'var(--level-hcg)',
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 600 }}>{zumara.name}</h1>
          {zumara.zumara?.activityDomain && (
            <span style={{
              padding: '3px 10px',
              background: 'rgba(167,139,250,0.12)',
              border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: 5,
              color: 'var(--level-hcg)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}>
              {zumara.zumara.activityDomain}
            </span>
          )}
        </div>
        {zumara.zumara?.mission && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{zumara.zumara.mission}</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Members */}
        <Panel title={`Membres (${members.length})`}>
          {members.length === 0 ? <Empty>Aucun membre</Empty> : (
            members.slice(0, 6).map((m: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {m.gamad?.profile?.displayName ?? 'Citoyen'}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{m.role?.name ?? ''}</span>
              </div>
            ))
          )}
        </Panel>

        {/* Activities */}
        <Panel title="Activités">
          {activities.length === 0 ? <Empty>Aucune activité</Empty> : (
            activities.map((a: any) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', flex: 1 }}>{a.title}</span>
                <span style={{
                  padding: '1px 6px',
                  borderRadius: 3,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#9ca3af',
                  background: 'rgba(156,163,175,0.1)',
                  flexShrink: 0,
                }}>
                  {a.status}
                </span>
              </div>
            ))
          )}
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Documents */}
        <Panel title="Documents produits">
          {documents.length === 0 ? <Empty>Aucun document</Empty> : (
            documents.map((d: any) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', flex: 1 }}>{d.title}</span>
                <span style={{
                  padding: '1px 6px',
                  borderRadius: 3,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: classificationColor[d.classification] ?? '#9ca3af',
                  background: `${classificationColor[d.classification] ?? '#9ca3af'}15`,
                  flexShrink: 0,
                }}>
                  {d.classification}
                </span>
              </div>
            ))
          )}
        </Panel>

        {/* Announcements */}
        <Panel title="Annonces internes">
          {announcements.length === 0 ? <Empty>Aucune annonce</Empty> : (
            announcements.map((a: any) => (
              <div key={a.id}>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{a.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 2 }}>
                  {a.publisher?.profile?.displayName ?? '—'}
                </div>
              </div>
            ))
          )}
        </Panel>
      </div>

      {/* Threads */}
      <Panel title="Fil de discussion privé">
        {threads.length === 0 ? <Empty>Aucune discussion privée dans cette Zumara</Empty> : (
          threads.map((t: any) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{t.title}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                {t._count?.posts ?? 0} msg
              </span>
            </div>
          ))
        )}
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{children}</p>;
}

function Loader() {
  return (
    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', padding: '2rem' }}>
      Chargement…
    </div>
  );
}
