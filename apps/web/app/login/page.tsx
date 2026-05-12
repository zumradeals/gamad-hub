"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiBaseUrl } from "../../lib/api-client";

type LoginSuccessPayload = {
  token: string;
  gamadId: string;
  publicCode: string;
  profile?: {
    displayName?: string;
  };
};

type LoginEnvelope = {
  success?: boolean;
  data?: LoginSuccessPayload;
  error?: {
    message?: string;
  };
  message?: string | string[];
};

function readErrorMessage(payload: LoginEnvelope): string {
  if (payload.error?.message) {
    return payload.error.message;
  }
  if (Array.isArray(payload.message)) {
    return payload.message.join(" ");
  }
  if (typeof payload.message === "string") {
    return payload.message;
  }
  return "Echec de connexion. Verifiez vos identifiants.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const payload = (await response.json().catch(() => ({}))) as LoginEnvelope;
      if (!response.ok || !payload.success || !payload.data?.token || !payload.data.gamadId) {
        setErrorMessage(readErrorMessage(payload));
        return;
      }

      window.localStorage.setItem("gamadAuthToken", payload.data.token);
      window.localStorage.setItem("gamadActorId", payload.data.gamadId);
      document.cookie = `gamad_auth_token=${encodeURIComponent(payload.data.token)}; Path=/; Max-Age=86400; SameSite=Lax`;
      document.cookie = `gamad_actor_id=${encodeURIComponent(payload.data.gamadId)}; Path=/; Max-Age=86400; SameSite=Lax`;
      router.replace("/dashboard");
    } catch {
      setErrorMessage("Erreur reseau. Reessayez dans quelques instants.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="content">
      <div className="page-header">
        <h1>Connexion</h1>
      </div>
      <section className="panel">
        <form onSubmit={onSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
          {errorMessage ? <p role="alert">{errorMessage}</p> : null}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}
