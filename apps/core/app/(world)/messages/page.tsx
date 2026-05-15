'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

interface Message {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  sender?: { profile?: { displayName: string } };
  recipient?: { profile?: { displayName: string } };
}

const tabs = ['Reçus', 'Envoyés', 'Nouveau'] as const;
type Tab = typeof tabs[number];

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Reçus');
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [recipientCode, setRecipientCode] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Message[]>('/communication/messages/inbox').catch(() => []),
      api.get<Message[]>('/communication/messages/sent').catch(() => []),
    ]).then(([i, s]) => { setInbox(i); setSent(s); }).finally(() => setLoading(false));
  }, []);

  const openMessage = (msg: Message) => {
    if (msg.status === 'SENT' && activeTab === 'Reçus') {
      api.patch(`/communication/messages/${msg.id}/read`).catch(() => {});
      setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'READ' } : m));
    }
    setSelected(msg);
  };

  const sendMessage = async () => {
    if (!recipientCode.trim() || !content.trim()) return;
    setSending(true);
    try {
      const msg = await api.post<Message>('/communication/messages', { recipientPublicCode: recipientCode, content });
      setSent(prev => [msg, ...prev]);
      setRecipientCode('');
      setContent('');
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

  if (loading) return <p style={{ color: '#8b949e' }}>Chargement…</p>;

  if (selected) {
    const fromInbox = activeTab === 'Reçus';
    const otherName = fromInbox
      ? (selected.sender?.profile?.displayName ?? 'Citoyen')
      : (selected.recipient?.profile?.displayName ?? 'Citoyen');
    return (
      <div style={{ color: '#e6edf3' }}>
        <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}>← Retour</button>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '1.5rem' }}>
          <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #21262d', fontSize: '0.82rem', color: '#8b949e' }}>
            {fromInbox ? 'De' : 'À'} : <strong style={{ color: '#e6edf3' }}>{otherName}</strong>
            <span style={{ marginLeft: '1rem' }}>{new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <p style={{ margin: 0, lineHeight: 1.65, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{selected.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Messagerie</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#8b949e', fontSize: '0.875rem' }}>Communications privées entre citoyens.</p>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #21262d', marginBottom: '1.25rem' }}>
        {tabs.map(t => <button key={t} style={tabStyle(t)} onClick={() => { setActiveTab(t); setSelected(null); }}>{t}</button>)}
      </div>

      {activeTab === 'Reçus' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {inbox.length === 0 ? <p style={{ color: '#8b949e' }}>Aucun message reçu.</p> : inbox.map(msg => {
            const unread = msg.status === 'SENT';
            return (
              <div key={msg.id} onClick={() => openMessage(msg)} style={{ background: unread ? '#E5C10008' : '#161b22', border: `1px solid ${unread ? '#E5C10044' : '#30363d'}`, borderRadius: 8, padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                    {unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E5C100', display: 'inline-block' }} />}
                    <span style={{ fontWeight: unread ? 700 : 500, fontSize: '0.875rem' }}>{msg.sender?.profile?.displayName ?? 'Citoyen'}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>{msg.content}</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#8b949e', flexShrink: 0 }}>{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'Envoyés' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {sent.length === 0 ? <p style={{ color: '#8b949e' }}>Aucun message envoyé.</p> : sent.map(msg => (
            <div key={msg.id} onClick={() => openMessage(msg)} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.2rem' }}>→ {msg.recipient?.profile?.displayName ?? 'Citoyen'}</div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>{msg.content}</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#8b949e', flexShrink: 0 }}>{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Nouveau' && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '1.25rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#8b949e', marginBottom: '0.3rem' }}>Code public GAMAD du destinataire</label>
            <input value={recipientCode} onChange={e => setRecipientCode(e.target.value)} placeholder="GAM-XXXX" style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '0.5rem 0.75rem', fontSize: '0.875rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#8b949e', marginBottom: '0.3rem' }}>Message</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} placeholder="Votre message…" maxLength={2000} style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '0.5rem 0.75rem', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <button onClick={sendMessage} disabled={sending || !recipientCode.trim() || !content.trim()} style={{ background: '#E5C100', color: '#071326', border: 'none', borderRadius: 6, padding: '0.55rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      )}
    </div>
  );
}
