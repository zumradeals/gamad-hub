'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { authGet, getToken } from '../../../lib/api';

interface Wallet {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

interface Reputation {
  score: number;
  contentScore: number;
  engagementScore: number;
  trustLevel: string;
  totalPosts: number;
  totalComments: number;
  totalReactions: number;
}

interface Transaction {
  id: string;
  fromId: string | null;
  toId: string;
  amount: number;
  reason: string;
  note: string | null;
  createdAt: string;
}

interface WalletData {
  wallet: Wallet;
  reputation: Reputation;
  transactions: Transaction[];
}

const TRUST_LABELS: Record<string, { label: string; cls: string; desc: string }> = {
  NEWCOMER: { label: 'Nouveau',   cls: 'badge-muted', desc: 'Publication soumise à modération' },
  MEMBER:   { label: 'Membre',    cls: 'badge-blue',  desc: 'Publication modérée rapidement' },
  TRUSTED:  { label: 'Confirmé',  cls: 'badge-green', desc: 'Publication directe autorisée' },
  VETERAN:  { label: 'Vétéran',   cls: 'badge-gold',  desc: 'Accès modérateur' },
  GUARDIAN: { label: 'Gardien',   cls: 'badge-gold',  desc: 'Autorité éditoriale' },
};

const REASON_LABELS: Record<string, string> = {
  REGISTRATION_BONUS: '🎁 Bonus de bienvenue',
  CONTENT_PUBLISHED:  '📝 Publication de contenu',
  CONTENT_REWARD:     '⭐ Récompense contenu',
  COMMENT_REWARD:     '💬 Récompense commentaire',
  REACTION_RECEIVED:  '👍 Réaction reçue',
  REFERRAL:           '🔗 Parrainage',
  MANUAL_CREDIT:      '📥 Crédit manuel',
  MANUAL_DEBIT:       '📤 Débit manuel',
  CONVERSION_REQUEST: '💱 Conversion',
  COTISATION_PAYMENT: '🏛 Cotisation',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function WalletPage() {
  const router = useRouter();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.push('/connexion'); return; }
    authGet<WalletData>('/portal/wallet')
      .then(setData)
      .catch(() => router.push('/connexion'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <>
        <Nav />
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>Chargement…</p>
        </main>
      </>
    );
  }

  const { wallet, reputation, transactions } = data!;
  const trust = TRUST_LABELS[reputation.trustLevel] ?? TRUST_LABELS.NEWCOMER;

  const nextThresholds: Record<string, number> = {
    NEWCOMER: 50, MEMBER: 200, TRUSTED: 1000, VETERAN: 5000, GUARDIAN: Infinity,
  };
  const nextThreshold = nextThresholds[reputation.trustLevel] ?? Infinity;
  const progress = nextThreshold === Infinity ? 100 : Math.min(100, (reputation.score / nextThreshold) * 100);

  return (
    <>
      <Nav />
      <main style={{ padding: '2.5rem 2rem', minHeight: '80vh' }}>
        <div className="container">
          {/* Breadcrumb */}
          <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
            <Link href="/dashboard" style={{ color: 'var(--blue)' }}>Dashboard</Link>
            {' → '}
            <span>Wallet ZAHAB</span>
          </div>

          <h1 style={{ fontSize: '1.625rem', marginBottom: '2rem' }}>Mon Wallet ZAHAB</h1>

          {/* Cartes principales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {/* Solde */}
            <div className="card" style={{ background: 'var(--navy)', color: 'white', border: 'none' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Solde disponible
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
                {wallet.balance.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>ZAHAB</div>
            </div>

            {/* Total gagné */}
            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Total gagné
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
                {wallet.totalEarned.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '0.25rem' }}>ZAHAB</div>
            </div>

            {/* Score réputation */}
            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Réputation
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-mono)' }}>
                  {reputation.score}
                </span>
                <span className={`badge ${trust.cls}`}>{trust.label}</span>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--gold)', height: '100%', width: `${progress}%`, transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.375rem' }}>
                {trust.desc}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Statistiques publications */}
            <div className="card">
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>Activité</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { label: 'Publications', value: reputation.totalPosts },
                  { label: 'Commentaires', value: reputation.totalComments },
                  { label: 'Réactions reçues', value: reputation.totalReactions },
                  { label: 'Score contenu', value: reputation.contentScore },
                  { label: 'Score engagement', value: reputation.engagementScore },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Niveaux de confiance */}
            <div className="card">
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>Niveaux de confiance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { level: 'NEWCOMER', threshold: 0,    label: 'Nouveau' },
                  { level: 'MEMBER',   threshold: 50,   label: 'Membre' },
                  { level: 'TRUSTED',  threshold: 200,  label: 'Confirmé' },
                  { level: 'VETERAN',  threshold: 1000, label: 'Vétéran' },
                  { level: 'GUARDIAN', threshold: 5000, label: 'Gardien' },
                ].map(l => {
                  const reached = reputation.score >= l.threshold;
                  const isCurrent = reputation.trustLevel === l.level;
                  return (
                    <div key={l.level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ color: reached ? 'var(--navy)' : 'var(--muted)', fontWeight: isCurrent ? 600 : 400 }}>
                        {isCurrent ? '▶ ' : ''}{l.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: reached ? 'var(--green)' : 'var(--muted)' }}>
                        {l.threshold === 0 ? 'Départ' : `${l.threshold} pts`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Historique transactions */}
          <div className="card">
            <h3 style={{ fontSize: '0.9375rem', marginBottom: '1.25rem' }}>Historique des transactions</h3>
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Aucune transaction pour le moment.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {transactions.map(tx => {
                  const isCredit = !tx.fromId;
                  return (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {REASON_LABELS[tx.reason] ?? tx.reason}
                        </div>
                        {tx.note && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>{tx.note}</div>}
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                          {formatDate(tx.createdAt)}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: isCredit ? 'var(--green)' : 'var(--danger)',
                      }}>
                        {isCredit ? '+' : '-'}{tx.amount.toFixed(2)} Z
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
            ZAHAB est la monnaie officielle de l'écosystème GAMAD.
            La conversion en monnaie locale sera disponible prochainement.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
