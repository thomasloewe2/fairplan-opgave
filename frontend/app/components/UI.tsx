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

// Success notifications expire; inline validation can opt out using durationMs={0}.
export function Notice({ message, kind = "error", durationMs = 10_000 }: {
  message: string | null;
  kind?: "error" | "success" | "info";
  durationMs?: number;
}) {
  const [hidden, setHidden] = useState(false);
  const [remaining, setRemaining] = useState(Math.ceil(durationMs / 1000));

  useEffect(() => {
    setHidden(false);
    if (!message || durationMs <= 0) return;
    const expires = Date.now() + durationMs;
    setRemaining(Math.ceil(durationMs / 1000));
    const interval = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((expires - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) setHidden(true);
    }, 200);
    return () => window.clearInterval(interval);
  }, [message, durationMs]);

  if (!message || hidden) return null;
  return <div role={kind === "error" ? "alert" : "status"} className={`notice notice-${kind}`}>
    <span className="notice-message">{message}</span>
    <span className="notice-controls">
      {durationMs > 0 && <span className="notice-countdown" aria-label={`Forsvinder om ${remaining} sekunder`}>{remaining}s</span>}
      <button className="notice-close" type="button" aria-label="Luk besked" onClick={() => setHidden(true)}>×</button>
    </span>
  </div>;
}

export function Loading() {
  return <div className="loading" role="status"><span className="spinner" /> Henter data…</div>;
}

export function Dialog({ title, children, onClose }: {
  title: string; children: React.ReactNode; onClose: () => void;
}) {
  const headingId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    // Restore focus after closing and keep keyboard navigation inside the open dialog.
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab") return;
      const elements = [...(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
      ) ?? [])];
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return <div className="dialog-backdrop" onMouseDown={e => {
    if (e.target === e.currentTarget) onClose();
  }}>
    <div className="dialog-panel" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={headingId}>
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

export function ColorField({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const valid = /^#[0-9a-f]{6}$/i.test(value);
  return <div className="color-control">
    <input type="color" aria-label="Vælg farve" value={valid ? value : "#2563EB"}
      onChange={e => onChange(e.target.value.toUpperCase())} />
    <input type="text" aria-label="HEX-farvekode" value={value} onChange={e => onChange(e.target.value)}
      maxLength={7} placeholder="#2563EB" pattern="#[A-Fa-f0-9]{6}"
      title="HEX-kode med # og seks cifre" required />
    <span className="color-swatch" style={{ background: valid ? value : "#E5E7EB" }} aria-hidden="true" />
  </div>;
}
