"use client";

import { FormEvent, useState } from "react";
import { documentsApi, type CreateDocumentInput } from "../../lib/api-client";
import { ActionButton } from "../ui/action-button";
import { ApiErrorAlert } from "../ui/api-error-alert";
import { ConfirmDialog } from "../ui/confirm-dialog";

const initialForm: CreateDocumentInput = {
  title: "",
  documentType: "report",
  classification: "internal",
  organizationUnitId: ""
};

export function CreateDocumentForm() {
  const [form, setForm] = useState(initialForm);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState("");

  function updateField(field: keyof CreateDocumentInput, value: string) {
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
      await documentsApi.createDocument({
        ...form,
        organizationUnitId: form.organizationUnitId || undefined
      });
      setForm(initialForm);
      setSuccess("Document cree. Rafraichissement manuel necessaire si la liste ne se met pas a jour.");
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
      <ActionButton onClick={() => setIsOpen((current) => !current)}>Creer un document</ActionButton>
      {success ? <div className="api-alert api-alert-success">{success}</div> : null}
      {isOpen ? (
        <form className="form-panel" onSubmit={requestSubmit}>
          <label>
            Titre
            <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} />
          </label>
          <label>
            Type de document
            <select required value={form.documentType} onChange={(event) => updateField("documentType", event.target.value)}>
              <option value="statute">statute</option>
              <option value="report">report</option>
              <option value="manual">manual</option>
              <option value="procedure">procedure</option>
              <option value="media">media</option>
              <option value="archive">archive</option>
              <option value="training">training</option>
            </select>
          </label>
          <label>
            Classification
            <select required value={form.classification} onChange={(event) => updateField("classification", event.target.value)}>
              <option value="public">public</option>
              <option value="internal">internal</option>
              <option value="confidential">confidential</option>
              <option value="strategic">strategic</option>
            </select>
          </label>
          <label>
            Organization Unit ID
            <input value={form.organizationUnitId} onChange={(event) => updateField("organizationUnitId", event.target.value)} />
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
        message="Confirmer la creation de ce document ?"
        onCancel={() => setIsConfirming(false)}
        onConfirm={submit}
        disabled={isSubmitting}
      />
    </div>
  );
}
