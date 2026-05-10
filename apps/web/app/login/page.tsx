export default function LoginPage() {
  return (
    <main className="content">
      <div className="page-header">
        <h1>Connexion</h1>
      </div>
      <section className="panel">
        <form>
          <input type="email" name="email" placeholder="Email" />
          <input type="password" name="password" placeholder="Mot de passe" />
          <button type="submit">Se connecter</button>
        </form>
      </section>
    </main>
  );
}
