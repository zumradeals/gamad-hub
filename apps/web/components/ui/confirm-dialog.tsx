"use client";

import { ActionButton } from "./action-button";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  disabled?: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

export function ConfirmDialog({
  cancelLabel = "Annuler",
  confirmLabel = "Confirmer",
  disabled = false,
  message,
  onCancel,
  onConfirm,
  open,
  title
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="confirm-dialog-panel">
        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="form-actions">
          <ActionButton variant="secondary" onClick={onCancel} disabled={disabled}>
            {cancelLabel}
          </ActionButton>
          <ActionButton onClick={onConfirm} disabled={disabled}>
            {confirmLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
