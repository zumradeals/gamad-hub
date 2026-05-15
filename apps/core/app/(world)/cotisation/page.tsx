'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { getCitizen } from '../../../lib/citizen';

interface CotisationStatus {
  isPaid: boolean;
  currentPeriod: Period | null;
  lastPayment: Payment | null;
}

interface Period {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  amount: number;
  isActive: boolean;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paidAt: string;
  period?: { label: string };
}

const btn = (color: string): React.CSSProperties => ({
  background: color, color: '#fff', border: 'none', borderRadius: 6,
  padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
});

export default function CotisationPage() {
  const [status, setStatus] = useState<CotisationStatus | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const citizen = getCitizen();

  useEffect(() => {
    Promise.all([
      api.get<CotisationStatus>('/cotisation/my/status').catch(() => null),
      api.get<Period[]>('/cotisation/periods').catch(() => []),
      api.get<Payment[]>('/cotisation/my/payments').catch(() => []),
    ]).then(([s, p, pay]) => {
      if (s) setStatus(s);
      if (p) { setPeriods(p); if (p.length > 0) setSelectedPeriod(p[0].id); }
      if (pay) setPayments(pay);
    }).finally(() => setLoading(false));
  }, []);

  const pay = async () => {
    if (!selectedPeriod) return;
    setPaying(true);
    const period = periods.find(p => p.id === selectedPeriod);
    if (!period) { setPaying(false); return; }
    const result = await api.post<Payment>('/cotisation/payments', {
      periodId: selectedPeriod,
      amount: period.amount,
    }).catch(() => null);
    if (result) {
      setPayments(prev => [result, ...prev]);
      const s = await api.get<CotisationStatus>('/cotisation/my/status').catch(() => null);
      if (s) setStatus(s);
    }
    setPaying(false);
  };

  if (loading) return <p style={{ color: '#8b949e' }}>Chargement…</p>;

  const activePeriod = periods.find(p => p.isActive);

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Cotisation</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#8b949e', fontSize: '0.875rem' }}>Votre statut et historique de paiements.</p>
      </div>

      {/* Statut */}
      <div style={{ background: status?.isPaid ? '#0E9F4B18' : '#f8711818', border: `1px solid ${status?.isPaid ? '#0E9F4B' : '#f87171'}`, borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: status?.isPaid ? '#34d399' : '#f87171' }}>
            {status?.isPaid ? '✓ Cotisation à jour' : '⚠ Cotisation non réglée'}
          </div>
          {status?.currentPeriod && (
            <div style={{ fontSize: '0.82rem', color: '#8b949e' }}>
              Période : {status.currentPeriod.label} ·
              du {new Date(status.currentPeriod.startDate).toLocaleDateString('fr-FR')}
              au {new Date(status.currentPeriod.endDate).toLocaleDateString('fr-FR')}
            </div>
          )}
          {status?.lastPayment && (
            <div style={{ fontSize: '0.82rem', color: '#8b949e', marginTop: '0.25rem' }}>
              Dernier paiement : {status.lastPayment.amount} {status.lastPayment.currency} · {new Date(status.lastPayment.paidAt).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
        {!status?.isPaid && activePeriod && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E5C100', fontFamily: 'monospace' }}>
              {activePeriod.amount} XOF
            </div>
            <button style={btn('#E5C100')} onClick={pay} disabled={paying}>
              {paying ? 'Paiement…' : 'Payer maintenant'}
            </button>
          </div>
        )}
      </div>

      {/* Périodes disponibles */}
      {periods.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#8b949e' }}>Périodes de cotisation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {periods.map(p => (
              <div key={p.id} style={{ background: '#161b22', border: `1px solid ${p.isActive ? '#E5C100' : '#30363d'}`, borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', marginRight: '0.5rem' }}>{p.label}</span>
                  {p.isActive && <span style={{ background: '#E5C10022', color: '#E5C100', borderRadius: 4, padding: '0.05rem 0.4rem', fontSize: '0.7rem', fontWeight: 700 }}>ACTIVE</span>}
                  <div style={{ color: '#8b949e', fontSize: '0.78rem', marginTop: '0.1rem' }}>
                    {new Date(p.startDate).toLocaleDateString('fr-FR')} — {new Date(p.endDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#E5C100', fontFamily: 'monospace' }}>{p.amount} XOF</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Historique paiements */}
      <section>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#8b949e' }}>Historique des paiements</h2>
        {payments.length === 0 ? (
          <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Aucun paiement enregistré.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {payments.map(p => (
              <div key={p.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '0.6rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.period?.label ?? 'Paiement'}</span>
                  <div style={{ color: '#8b949e', fontSize: '0.78rem' }}>{new Date(p.paidAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>+{p.amount} {p.currency}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
