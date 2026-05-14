export default function CotisationPage() {
  return (
    <div>
      <h1 style={{ color: '#e6edf3', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Cotisation
      </h1>
      <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Votre statut et historique de paiements.
      </p>
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '1.5rem' }}>
        <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Aucune cotisation enregistrée.</p>
      </div>
    </div>
  );
}
