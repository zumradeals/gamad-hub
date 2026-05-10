"use client";

import { FormEvent, useState } from "react";
import { identityApi, type CreateGamadIdInput } from "../../lib/api-client";
import { ActionButton } from "../ui/action-button";
import { ApiErrorAlert } from "../ui/api-error-alert";
import { ConfirmDialog } from "../ui/confirm-dialog";

const initialForm: CreateGamadIdInput = {
  displayName: "",
  email: "",
  phone: "",
  password: "",
  identityType: "person"
};

export function CreateMemberForm() {
  const [form, setForm] = useState(initialForm);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState("");

  function updateField(field: keyof CreateGamadIdInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function requestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess("");
    setIsConfirming(true);
  }

  async function submit() {
    setIsSubmitting(true);
    setError(null);
    try {
      await identityApi.createGamadId(form);
      setForm(initialForm);
      setSuccess("Membre cree. Rafraichissement manuel necessaire si la liste ne se met pas a jour.");
      setIsOpen(false);
      setIsConfirming(false);
    } catch (caughtError) {
      setError(caughtError);
      setIsConfirming(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="crud-action">
      <ActionButton onClick={() => setIsOpen((current) => !current)}>Ajouter un membre</ActionButton>
      {success ? <div className="api-alert api-alert-success">{success}</div> : null}
      {isOpen ? (
        <form className="form-panel" onSubmit={requestSubmit}>
          <label>
            Nom affiche
            <input required value={form.displayName} onChange={(event) => updateField("displayName", event.target.value)} />
          </label>
          <label>
            Email
            <input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          </label>
          <label>
            Telephone
            <input required value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </label>
          <label>
            Mot de passe
            <input required minLength={8} type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} />
          </label>
          <label>
            Type d'identite
            <select required value={form.identityType} onChange={(event) => updateField("identityType", event.target.value)}>
              <option value="person">person</option>
              <option value="organization">organization</option>
              <option value="system">system</option>
            </select>
          </label>
          <ApiErrorAlert error={error} />
          <div className="form-actions">
            <ActionButton variant="secondary" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Annuler
            </ActionButton>
            <ActionButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creation..." : "Creer"}
            </ActionButton>
          </div>
        </form>
      ) : null}
      <ConfirmDialog
        open={isConfirming}
        title="Confirmer la creation"
        message="Confirmer la creation de ce GAMAD ID ?"
        onCancel={() => setIsConfirming(false)}
        onConfirm={submit}
        disabled={isSubmitting}
      />
    </div>
  );
}
