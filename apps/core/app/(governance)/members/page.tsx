export default function MembersPage() {
  return (
    <div>
      <h1 style={{ color: '#e6edf3', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Gestion des membres
      </h1>
      <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Réservé aux responsables et à la gouvernance.
      </p>
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '1.5rem' }}>
        <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Liste des membres — accès RESPONSABLE requis.</p>
      </div>
    </div>
  );
}
