"use client";

import { FormEvent, useState } from "react";
import { organizationApi, type CreateOrganizationUnitInput } from "../../lib/api-client";
import { ActionButton } from "../ui/action-button";
import { ApiErrorAlert } from "../ui/api-error-alert";
import { ConfirmDialog } from "../ui/confirm-dialog";

const initialForm: CreateOrganizationUnitInput = {
  name: "",
  type: "department",
  parentId: "",
  description: ""
};

export function CreateOrganizationUnitForm() {
  const [form, setForm] = useState(initialForm);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState("");

  function updateField(field: keyof CreateOrganizationUnitInput, value: string) {
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
      await organizationApi.createUnit({
        ...form,
        parentId: form.parentId || undefined,
        description: form.description || undefined
      });
      setForm(initialForm);
      setSuccess("Structure creee. Rafraichissement manuel necessaire si la liste ne se met pas a jour.");
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
      <ActionButton onClick={() => setIsOpen((current) => !current)}>Creer une structure</ActionButton>
      {success ? <div className="api-alert api-alert-success">{success}</div> : null}
      {isOpen ? (
        <form className="form-panel" onSubmit={requestSubmit}>
          <label>
            Nom
            <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          </label>
          <label>
            Type
            <select required value={form.type} onChange={(event) => updateField("type", event.target.value)}>
              <option value="hcg">hcg</option>
              <option value="department">department</option>
              <option value="coordination">coordination</option>
              <option value="section">section</option>
              <option value="zumara">zumara</option>
            </select>
          </label>
          <label>
            Parent ID
            <input value={form.parentId} onChange={(event) => updateField("parentId", event.target.value)} />
          </label>
          <label>
            Description
            <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} />
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
        message="Confirmer la creation de cette structure ?"
        onCancel={() => setIsConfirming(false)}
        onConfirm={submit}
        disabled={isSubmitting}
      />
    </div>
  );
}
