export default function LoginPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0d1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: '2.5rem',
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: 12,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ color: '#d4a017', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.1em' }}>
            GAMAD HUB
          </span>
          <p style={{ color: '#8b949e', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Accès espace citoyen
          </p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: '#8b949e', fontSize: '0.75rem', marginBottom: 4 }}>
              Adresse email
            </label>
            <input
              type="email"
              placeholder="votre@email.com"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: 6,
                color: '#e6edf3',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#8b949e', fontSize: '0.75rem', marginBottom: 4 }}>
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: 6,
                color: '#e6edf3',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: '#d4a017',
              color: '#0d1117',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            Connexion
          </button>
        </form>
      </div>
    </main>
  );
}
