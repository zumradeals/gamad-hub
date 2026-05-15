'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { publicGet, getToken, authPost } from '../../../lib/api';

interface PublicProfile {
  publicCode: string;
  displayName: string;
  bio: string | null;
  country: string | null;
  city: string | null;
  trustLevel: string;
  reputationScore: number;
  completedFormations: number;
  formations: string[];
  zumara: { name: string; slug: string; type: string; role: string }[];
  recentPosts: { id: string; content: string; createdAt: string }[];
  memberSince: string;
}

const trustColors: Record<string, string> = {
  NEWCOMER: '#8b949e',
  MEMBER: '#58a6ff',
  TRUSTED: '#3fb950',
  VETERAN: '#E5C100',
  GUARDIAN: '#f78166',
};

export default function PublicProfilePage() {
  const { publicCode } = useParams<{ publicCode: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  const [sending, setSending] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const isLoggedIn = !!getToken();

  useEffect(() => {
    publicGet<PublicProfile>(`/portal/profiles/${publicCode}`)
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [publicCode]);

  const sendMessage = async () => {
    if (!msgContent.trim()) return;
    setSending(true);
    try {
      await authPost('/portal/messages', { recipientPublicCode: publicCode, content: msgContent });
      setMsgSent(true);
      setMsgContent('');
    } catch {
      alert('Erreur lors de l\'envoi du message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div style={{ color: '#8b949e', padding: '2rem' }}>Chargement…</div>;
  if (notFound || !profile) return (
    <div style={{ color: '#f87171', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404</div>
      <div>Profil introuvable.</div>
      <button onClick={() => router.push('/citoyens')} style={{ marginTop: '1rem', background: '#E5C100', color: '#071326', border: 'none', borderRadius: 6, padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 700 }}>Voir l'annuaire</button>
    </div>
  );

  const trustColor = trustColors[profile.trustLevel] ?? '#8b949e';
  const joinDate = new Date(profile.memberSince).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1rem', color: '#e6edf3' }}>
      {/* Hero */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#E5C10033', border: '2px solid #E5C100', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>{profile.displayName}</h1>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ background: `${trustColor}22`, color: trustColor, borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.72rem', fontWeight: 700 }}>{profile.trustLevel}</span>
              {profile.country && <span style={{ color: '#8b949e', fontSize: '0.82rem' }}>🌍 {profile.city ? `${profile.city}, ` : ''}{profile.country}</span>}
              <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>Membre depuis {joinDate}</span>
            </div>
            {profile.bio && <p style={{ margin: '0.75rem 0 0', color: '#adbac7', fontSize: '0.9rem', lineHeight: 1.5 }}>{profile.bio}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#E5C100', fontFamily: 'JetBrains Mono, monospace' }}>{profile.reputationScore}</div>
            <div style={{ fontSize: '0.72rem', color: '#8b949e' }}>pts réputation</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Formations */}
        {profile.formations.length > 0 && (
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '1.25rem' }}>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Formations ({profile.completedFormations})</h2>
            {profile.formations.map((f, i) => (
              <div key={i} style={{ fontSize: '0.82rem', color: '#e6edf3', padding: '0.3rem 0', borderBottom: i < profile.formations.length - 1 ? '1px solid #21262d' : 'none' }}>✓ {f}</div>
            ))}
          </div>
        )}

        {/* Zumara */}
        {profile.zumara.length > 0 && (
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '1.25rem' }}>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zumara</h2>
            {profile.zumara.map((z, i) => (
              <div key={i} style={{ fontSize: '0.82rem', color: '#e6edf3', padding: '0.3rem 0', borderBottom: i < profile.zumara.length - 1 ? '1px solid #21262d' : 'none' }}>
                <span style={{ fontWeight: 600 }}>{z.name}</span>
                <span style={{ color: '#8b949e', marginLeft: '0.5rem' }}>{z.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent posts */}
      {profile.recentPosts.length > 0 && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Publications récentes</h2>
          {profile.recentPosts.map((post) => (
            <div key={post.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid #21262d' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: '#e6edf3', lineHeight: 1.5 }}>{post.content.slice(0, 200)}{post.content.length > 200 ? '…' : ''}</p>
              <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Message */}
      {isLoggedIn && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '1.25rem' }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Envoyer un message</h2>
          {msgSent ? (
            <div style={{ color: '#3fb950', fontSize: '0.875rem' }}>✓ Message envoyé avec succès.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <textarea value={msgContent} onChange={e => setMsgContent(e.target.value)} placeholder={`Écrire à ${profile.displayName}…`} rows={3} style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '0.6rem', fontSize: '0.875rem', resize: 'vertical' }} maxLength={2000} />
              <button onClick={sendMessage} disabled={sending || !msgContent.trim()} style={{ background: '#E5C100', color: '#071326', border: 'none', borderRadius: 6, padding: '0.5rem 1.25rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>
                {sending ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
