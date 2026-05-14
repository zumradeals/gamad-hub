export default function RejoindrePagePage() {
  return (
    <main style={{ background: '#f8f7f4', minHeight: '100vh', padding: '3rem 2rem', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Rejoindre
        </h1>
        <p style={{ color: '#6b6b6b', marginBottom: '2.5rem' }}>
          Soumettez votre candidature pour intégrer l'écosystème.
        </p>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            { label: 'Prénom', type: 'text', placeholder: 'Votre prénom' },
            { label: 'Nom', type: 'text', placeholder: 'Votre nom' },
            { label: 'Email', type: 'email', placeholder: 'votre@email.com' },
            { label: 'Téléphone', type: 'tel', placeholder: '+2250000000000' },
          ].map((field) => (
            <div key={field.label}>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#1a1a1a', marginBottom: 6, fontWeight: 500 }}>
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e2dc',
                  borderRadius: 6,
                  fontSize: '0.875rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  outline: 'none',
                }}
              />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: '#1a1a1a', marginBottom: 6, fontWeight: 500 }}>
              Motivation
            </label>
            <textarea
              rows={4}
              placeholder="Pourquoi souhaitez-vous rejoindre l'écosystème ?"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e2dc',
                borderRadius: 6,
                fontSize: '0.875rem',
                background: '#ffffff',
                color: '#1a1a1a',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>
          <button type="submit" style={{
            padding: '0.875rem',
            background: '#1a1a1a',
            color: '#f8f7f4',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: '0.9375rem',
            cursor: 'pointer',
          }}>
            Soumettre ma candidature
          </button>
        </form>
      </div>
    </main>
  );
}
