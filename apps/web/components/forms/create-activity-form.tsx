"use client";

import { FormEvent, useState } from "react";
import { activitiesApi, type CreateActivityInput } from "../../lib/api-client";
import { ActionButton } from "../ui/action-button";
import { ApiErrorAlert } from "../ui/api-error-alert";
import { ConfirmDialog } from "../ui/confirm-dialog";

const initialForm: CreateActivityInput = {
  title: "",
  description: "",
  organizationUnitId: "",
  priority: "normal",
  startDate: "",
  endDate: ""
};

type CreateActivityFormProps = {
  onCreated?: () => void | Promise<void>;
};

export function CreateActivityForm({ onCreated }: CreateActivityFormProps) {
  const [form, setForm] = useState(initialForm);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState("");

  function updateField(field: keyof CreateActivityInput, value: string) {
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
      await activitiesApi.createActivity(form);
      setForm(initialForm);
      setSuccess("Activité créée.");
      setIsOpen(false);
      setIsConfirming(false);
      await onCreated?.();
    } catch (caughtError) {
      setError(caughtError);
      setIsConfirming(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="crud-action">
      <ActionButton onClick={() => setIsOpen((current) => !current)}>Creer une activite</ActionButton>
      {success ? <div className="api-alert api-alert-success">{success}</div> : null}
      {isOpen ? (
        <form className="form-panel" onSubmit={requestSubmit}>
          <label>
            Titre
            <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} />
          </label>
          <label>
            Description
            <textarea required value={form.description} onChange={(event) => updateField("description", event.target.value)} />
          </label>
          <label>
            Organization Unit ID
            <input required value={form.organizationUnitId} onChange={(event) => updateField("organizationUnitId", event.target.value)} />
          </label>
          <label>
            Priorite
            <select required value={form.priority} onChange={(event) => updateField("priority", event.target.value)}>
              <option value="low">low</option>
              <option value="normal">normal</option>
              <option value="high">high</option>
              <option value="strategic">strategic</option>
            </select>
          </label>
          <label>
            Date de debut
            <input required type="date" value={form.startDate} onChange={(event) => updateField("startDate", event.target.value)} />
          </label>
          <label>
            Date de fin
            <input required type="date" value={form.endDate} onChange={(event) => updateField("endDate", event.target.value)} />
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
        message="Confirmer la creation de cette activite ?"
        onCancel={() => setIsConfirming(false)}
        onConfirm={submit}
        disabled={isSubmitting}
      />
    </div>
  );
}
