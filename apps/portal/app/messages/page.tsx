'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authGet, authPost, getToken } from '../../lib/api';

interface Message {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  sender?: { publicCode: string; profile?: { displayName: string } };
  recipient?: { publicCode: string; profile?: { displayName: string } };
}

const tabs = ['Reçus', 'Envoyés', 'Nouveau message'] as const;
type Tab = typeof tabs[number];

export default function MessagesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Reçus');
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [composeTo, setComposeTo] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!getToken()) { router.push('/connexion'); return; }
    Promise.all([
      authGet<Message[]>('/portal/messages/inbox').catch(() => []),
      authGet<Message[]>('/portal/messages/sent').catch(() => []),
    ]).then(([i, s]) => { setInbox(i); setSent(s); }).finally(() => setLoading(false));
  }, []);

  const openMessage = async (msg: Message) => {
    if (msg.status === 'SENT' && activeTab === 'Reçus') {
      authGet(`/portal/messages/${msg.id}`).catch(() => {});
      setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'READ' } : m));
    }
    setSelected(msg);
  };

  const sendMessage = async () => {
    if (!composeTo.trim() || !composeContent.trim()) return;
    setSending(true);
    try {
      const msg = await authPost<Message>('/portal/messages', { recipientPublicCode: composeTo, content: composeContent });
      setSent(prev => [msg, ...prev]);
      setComposeTo('');
      setComposeContent('');
      setActiveTab('Envoyés');
    } catch (e: any) {
      alert(e.message ?? 'Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  };

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '0.6rem 1.25rem', fontWeight: activeTab === t ? 700 : 500,
    color: activeTab === t ? '#e6edf3' : '#8b949e',
    background: 'none', border: 'none',
    borderBottom: activeTab === t ? '2px solid #E5C100' : '2px solid transparent',
    cursor: 'pointer', fontSize: '0.875rem',
  });

  const msgCardStyle = (unread: boolean): React.CSSProperties => ({
    background: unread ? '#E5C10008' : '#161b22',
    border: `1px solid ${unread ? '#E5C10044' : '#30363d'}`,
    borderRadius: 8, padding: '0.75rem 1rem',
    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  });

  if (loading) return <div style={{ color: '#8b949e', padding: '2rem' }}>Chargement…</div>;

  if (selected) {
    const fromInbox = activeTab === 'Reçus';
    const otherName = fromInbox
      ? (selected.sender?.profile?.displayName ?? selected.sender?.publicCode ?? '?')
      : (selected.recipient?.profile?.displayName ?? selected.recipient?.publicCode ?? '?');
    const otherCode = fromInbox ? selected.sender?.publicCode : selected.recipient?.publicCode;

    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem', color: '#e6edf3' }}>
        <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}>← Retour</button>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #21262d' }}>
            <div style={{ fontSize: '0.78rem', color: '#8b949e', marginBottom: '0.25rem' }}>
              {fromInbox ? 'De' : 'À'} : <a href={`/profil/${otherCode}`} style={{ color: '#58a6ff', textDecoration: 'none' }}>{otherName}</a>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>{new Date(selected.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <p style={{ margin: 0, lineHeight: 1.65, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{selected.content}</p>
          {fromInbox && (
            <div style={{ marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid #21262d' }}>
              <button onClick={() => { setActiveTab('Nouveau message'); setComposeTo(selected.sender?.publicCode ?? ''); setSelected(null); }} style={{ background: '#E5C100', color: '#071326', border: 'none', borderRadius: 6, padding: '0.45rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
                Répondre
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem', color: '#e6edf3' }}>
      <h1 style={{ margin: '0 0 1.25rem', fontSize: '1.4rem', fontWeight: 700 }}>Messages</h1>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #21262d', marginBottom: '1.25rem', gap: '0.25rem' }}>
        {tabs.map(t => <button key={t} style={tabStyle(t)} onClick={() => { setActiveTab(t); setSelected(null); }}>{t}</button>)}
      </div>

      {activeTab === 'Reçus' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {inbox.length === 0 ? (
            <p style={{ color: '#8b949e', textAlign: 'center', padding: '2rem 0' }}>Aucun message reçu.</p>
          ) : inbox.map(msg => {
            const unread = msg.status === 'SENT';
            const senderName = msg.sender?.profile?.displayName ?? msg.sender?.publicCode ?? '?';
            return (
              <div key={msg.id} style={msgCardStyle(unread)} onClick={() => openMessage(msg)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                    {unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E5C100', display: 'inline-block' }} />}
                    <span style={{ fontWeight: unread ? 700 : 500, fontSize: '0.875rem' }}>{senderName}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>{msg.content}</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#8b949e', flexShrink: 0, marginLeft: '0.75rem' }}>{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'Envoyés' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sent.length === 0 ? (
            <p style={{ color: '#8b949e', textAlign: 'center', padding: '2rem 0' }}>Aucun message envoyé.</p>
          ) : sent.map(msg => {
            const recipientName = msg.recipient?.profile?.displayName ?? msg.recipient?.publicCode ?? '?';
            return (
              <div key={msg.id} style={msgCardStyle(false)} onClick={() => { setActiveTab('Envoyés'); openMessage(msg); }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.2rem' }}>→ {recipientName}</div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>{msg.content}</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#8b949e', flexShrink: 0, marginLeft: '0.75rem' }}>{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'Nouveau message' && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '1.25rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#8b949e', marginBottom: '0.3rem' }}>Code public du destinataire</label>
            <input value={composeTo} onChange={e => setComposeTo(e.target.value)} placeholder="ex: GAM-XXXX" style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '0.5rem 0.75rem', fontSize: '0.875rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#8b949e', marginBottom: '0.3rem' }}>Message</label>
            <textarea value={composeContent} onChange={e => setComposeContent(e.target.value)} rows={6} placeholder="Votre message…" maxLength={2000} style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '0.5rem 0.75rem', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ fontSize: '0.72rem', color: '#8b949e', textAlign: 'right', marginTop: '0.2rem' }}>{composeContent.length}/2000</div>
          </div>
          <button onClick={sendMessage} disabled={sending || !composeTo.trim() || !composeContent.trim()} style={{ background: '#E5C100', color: '#071326', border: 'none', borderRadius: 6, padding: '0.55rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      )}
    </div>
  );
}
