import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title = "Confirm action",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
      <Modal title={title} onClose={onCancel}>
        <p className="confirm-message">{message}</p>
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
              type="button"
              className={`btn ${danger ? "danger" : "primary"}`}
              onClick={onConfirm}
              disabled={busy}
          >
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </Modal>
  );
}
