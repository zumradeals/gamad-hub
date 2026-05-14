export default function HomePage() {
  return (
    <main style={{ background: '#f8f7f4', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2rem',
        borderBottom: '1px solid #e5e2dc',
        background: '#f8f7f4',
      }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1.25rem', color: '#1a1a1a' }}>
          GAMAD
        </span>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          {['Blog', 'TV', 'Formations', 'Ressources', 'Services'].map((item) => (
            <a key={item} href={`/${item.toLowerCase()}`} style={{
              color: '#6b6b6b', textDecoration: 'none', fontSize: '0.875rem',
            }}>
              {item}
            </a>
          ))}
        </nav>
        <a href="/connexion" style={{
          padding: '0.5rem 1rem',
          border: '1px solid #1a1a1a',
          borderRadius: 6,
          color: '#1a1a1a',
          textDecoration: 'none',
          fontSize: '0.875rem',
        }}>
          Espace membre
        </a>
      </header>

      {/* Hero + G-SEARCH */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 2rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          color: '#1a1a1a',
          marginBottom: '1rem',
          lineHeight: 1.2,
        }}>
          Connaissances, formations,<br />ressources.
        </h1>
        <p style={{ color: '#6b6b6b', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: 480 }}>
          Recherchez parmi des milliers de ressources, articles et formations.
        </p>

        {/* G-SEARCH bar */}
        <div style={{
          display: 'flex',
          width: '100%',
          maxWidth: 640,
          background: '#ffffff',
          border: '1.5px solid #1a1a1a',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 1rem',
            color: '#9b9b9b',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Rechercher formations, articles, ressources..."
            style={{
              flex: 1,
              padding: '1rem 0.5rem',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              background: 'transparent',
              color: '#1a1a1a',
            }}
          />
          <button style={{
            padding: '0.75rem 1.5rem',
            background: '#1a1a1a',
            color: '#f8f7f4',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}>
            Rechercher
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          {['Formations', 'Articles', 'Vidéos', 'Ressources'].map((tag) => (
            <a key={tag} href={`/recherche?type=${tag.toLowerCase()}`} style={{
              padding: '0.375rem 0.875rem',
              border: '1px solid #e5e2dc',
              borderRadius: 20,
              fontSize: '0.8125rem',
              color: '#6b6b6b',
              textDecoration: 'none',
              background: '#ffffff',
            }}>
              {tag}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
