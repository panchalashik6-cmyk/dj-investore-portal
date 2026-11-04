import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  X,
  Clock3,
  AlertTriangle,
  Info,
  Sparkles,
  UserCheck
} from "lucide-react";

export function AdvisorAvatar({
  advisor,
  size = "medium",
  showStatus = false,
  className = ""
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials =
    advisor?.initials ||
    (advisor?.name
      ? advisor.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
      : "AD");
  const color = advisor?.color || "gold";

  return (
    <div className={`advisor-portrait-frame size-${size} ${className}`}>
      {advisor?.image && !imgFailed ? (
        <img
          src={advisor.image}
          alt={advisor.name || "Advisor"}
          className="advisor-portrait-img"
          onError={() => setImgFailed(true)}
          loading="lazy"
        />
      ) : (
        <div className={`avatar avatar-${color} fallback-avatar`}>
          {initials}
        </div>
      )}
      {showStatus && (
        <span
          className="advisor-status-indicator"
          title="Licensed and available for private consultation"
        />
      )}
    </div>
  );
}

export function PageTitle({ eyebrow, title, description, action }) {
  return (
    <div className="page-title-row">
      <div className="page-title-left">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-title-action">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status, size = "normal" }) {
  const label = status || "Draft";
  const key = label.toLowerCase().replace(/\s+/g, "-");

  const icons = {
    draft: <Clock3 size={13} />,
    requested: <Clock3 size={13} />,
    submitted: <CheckCircle2 size={13} />,
    confirmed: <CheckCircle2 size={13} />,
    approved: <CheckCircle2 size={13} />,
    completed: <CheckCircle2 size={13} />,
    "clarification-required": <AlertTriangle size={13} />,
    cancelled: <X size={13} />
  };

  return (
    <span className={`status-badge status-${key} status-badge-${size}`}>
      <span className="badge-icon">{icons[key] || <Info size={13} />}</span>
      <span className="badge-text">{label}</span>
    </span>
  );
}

export function Loading({ label = "Loading your workspace" }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-spinner-wrap">
        <LoaderCircle className="spin" size={32} />
      </div>
      <b>{label}</b>
      <p>Securely fetching authenticated records from the portal server…</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div className="error-icon-box">
        <AlertCircle size={28} />
      </div>
      <div className="error-state-content">
        <h3>Unable to load workspace data</h3>
        <p>{message || "An unexpected error occurred while communicating with the server."}</p>
        {onRetry && (
          <button type="button" className="btn btn-secondary btn-small" onClick={onRetry}>
            <Sparkles size={14} /> Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action, icon: Icon = CheckCircle2 }) {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrap">
        <Icon size={26} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="empty-action-wrap">{action}</div>}
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children, maxWidth = "580px" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    // Lock body scroll and compensate scrollbar width to prevent layout jump
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [onClose]);

  const modalElement = (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="modal"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-head-text">
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            className="icon-btn modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body-scroll">{children}</div>
      </section>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalElement, document.body) : null;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  onConfirm,
  onClose,
  busy = false,
  icon: Icon = AlertTriangle
}) {
  return (
    <Modal title={title} onClose={onClose} maxWidth="480px">
      <div className="confirm-modal-inner">
        <div className={`confirm-icon-box ${confirmVariant}`}>
          <Icon size={24} />
        </div>
        <div className="confirm-text">
          <p>{message}</p>
        </div>
      </div>
      <div className="modal-actions">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={busy}
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`btn btn-${confirmVariant}`}
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? "Processing..." : confirmLabel}
        </button>
      </div>
    </Modal>
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
  const isInfo = toast.type === "info";
  const isWarning = toast.type === "warning";

  let Icon = CheckCircle2;
  if (isError) Icon = AlertCircle;
  else if (isWarning) Icon = AlertTriangle;
  else if (isInfo) Icon = Info;

  const toastElement = (
    <div
      className={`toast toast-${toast.type || "success"}`}
      role={isError ? "alert" : "status"}
      aria-live="polite"
    >
      <div className="toast-icon">
        <Icon size={20} />
      </div>
      <div className="toast-message">
        <span className="toast-title">
          {isError ? "Error" : isWarning ? "Notice" : isInfo ? "Information" : "Success"}
        </span>
        <span className="toast-body">{toast.message}</span>
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(toastElement, document.body) : null;
}
