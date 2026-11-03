import { useEffect } from "react";
import { LoaderCircle, AlertCircle, CheckCircle2, X } from "lucide-react";

export function PageTitle({ eyebrow, title, description, action }) {
  return (
    <div className="page-title-row">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const label = status || "Draft";
  const key = label.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-badge status-${key}`}>{label}</span>;
}

export function Loading({ label = "Loading your workspace" }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <LoaderCircle className="spin" size={24} />
      <span>{label}…</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={22} className="error-state-icon" />
      <div>
        <b>We couldn't load this data</b>
        <p>{message}</p>
        {onRetry && (
          <button type="button" className="btn btn-secondary btn-small" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <CheckCircle2 size={22} />
      </div>
      <b>{title}</b>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="modal">
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;
  const isError = toast.type === "error";

  return (
    <div
      className={`toast toast-${toast.type || "success"}`}
      role={isError ? "alert" : "status"}
      aria-live="polite"
    >
      {isError ? (
        <AlertCircle size={18} className="toast-error-icon" />
      ) : (
        <CheckCircle2 size={18} />
      )}
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
