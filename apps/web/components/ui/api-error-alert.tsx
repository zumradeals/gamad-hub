"use client";

import { ApiClientError } from "../../lib/api-client";

type ApiErrorAlertProps = {
  error: unknown;
};

function getMessage(error: unknown): string {
  if (error instanceof ApiClientError && error.code === "PERMISSION_DENIED") {
    return "Action refusee : vos permissions actuelles ne permettent pas cette operation.";
  }
  if (error instanceof ApiClientError && error.code === "AUTH_REQUIRED") {
    return "Authentification requise : aucun acteur GAMAD valide n'a ete fourni.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Une erreur API est survenue.";
}

export function ApiErrorAlert({ error }: ApiErrorAlertProps) {
  if (!error) {
    return null;
  }

  return (
    <div className="api-alert api-alert-error" role="alert">
      {getMessage(error)}
    </div>
  );
}
