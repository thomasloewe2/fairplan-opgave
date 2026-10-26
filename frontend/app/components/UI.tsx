import { useEffect, useId, useRef, useState } from "react";

export function PageHeader({ title, description, actions }: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return <header className="page-header">
    <div>
      <h1>{title}</h1>
      {description && <p className="muted">{description}</p>}
    </div>
    {actions && <div className="page-actions">{actions}</div>}
  </header>;
}

export function Button({ children, variant = "primary", className = "", ...props }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  return <button {...props} className={`btn btn-${variant} ${className}`}>{children}</button>;
}

export function Notice({ message, kind = "error" }: { message: string | null; kind?: "error" | "success" | "info" }) {
  if (!message) return null;
  return <div role={kind === "error" ? "alert" : "status"} className={`notice notice-${kind}`}>{message}</div>;
}

export function Loading() {
  return <div className="loading" role="status"><span className="spinner" /> Henter data…</div>;
}

export function Dialog({ title, children, onClose }: {
  title: string; children: React.ReactNode; onClose: () => void;
}) {
  const headingId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return <div className="dialog-backdrop" onMouseDown={(e) => {
    if (e.target === e.currentTarget) onClose();
  }}>
    <div className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby={headingId}>
      <div className="dialog-heading">
        <h2 id={headingId}>{title}</h2>
        <button ref={closeRef} className="icon-button" type="button" onClick={onClose} aria-label="Luk">×</button>
      </div>
      {children}
    </div>
  </div>;
}

export function ConfirmDialog({ subject, onCancel, onConfirm, busy, error }: {
  subject: string; onCancel: () => void; onConfirm: () => void; busy: boolean; error: string | null;
}) {
  return <Dialog title="Bekræft sletning" onClose={onCancel}>
    <p>Vil du slette <strong>{subject}</strong>? Handlingen kan ikke fortrydes.</p>
    <Notice message={error} />
    <div className="dialog-actions">
      <Button variant="secondary" onClick={onCancel} disabled={busy}>Annuller</Button>
      <Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? "Sletter…" : "Slet"}</Button>
    </div>
  </Dialog>;
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  const id = useId();
  return <div className="field">
    <label htmlFor={id}>{label}</label>
    <div className="field-control">
      {typeof children === "object" && children !== null && "props" in children
        ? /* Input controls pass their own ids so label association stays explicit. */
          children
        : children}
    </div>
    {hint && <small className="muted">{hint}</small>}
  </div>;
}

export function ColorField({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const valid = /^#[0-9a-f]{6}$/i.test(value);
  return <div className="color-control">
    <input type="color" aria-label="Vælg farve" value={valid ? value : "#2563EB"}
      onChange={(e) => onChange(e.target.value.toUpperCase())} />
    <input type="text" aria-label="HEX-farvekode" value={value} onChange={(e) => onChange(e.target.value)}
      maxLength={7} placeholder="#2563EB" pattern="#[A-Fa-f0-9]{6}"
      title="HEX-kode med # og seks cifre" required />
    <span className="color-swatch" style={{ background: valid ? value : "#E5E7EB" }} aria-hidden="true" />
  </div>;
}

export function useFeedback() {
  const [message, setMessage] = useState<string | null>(null);
  return { message, success: (text: string) => setMessage(text), clear: () => setMessage(null) };
}
