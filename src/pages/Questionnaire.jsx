import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Eye,
  LockKeyhole,
  MessageSquareText,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  DollarSign,
  Calendar,
  FileCheck2,
  Info,
  Clock,
  ShieldCheck,
  UserCheck,
  Briefcase
} from "lucide-react";
import {
  getQuestions,
  getSubmissions,
  createSubmission,
  replaceSubmission,
  patchSubmission,
  addActivity,
  getErrorMessage
} from "../api/client";
import { useApp } from "../context/AppContext";
import { PageTitle, StatusBadge, Loading, ErrorState, EmptyState, Modal, Toast } from "../components/UI";

const sections = [
  "Personal information",
  "Immigration objectives",
  "Investment readiness",
  "Source of funds"
];

const sectionDescriptions = {
  "Personal information": "Verify your legal identity, residency jurisdiction, and correspondence details.",
  "Immigration objectives": "Define your primary immigration goals, target programs, and planned timeline.",
  "Investment readiness": "Specify your allocated investment capital and target portfolio deployment schedule.",
  "Source of funds": "Document your origin of funds to ensure regulatory compliance and anti-money laundering clearance."
};

/**
 * Format read-only answer values for the submitted view
 */
function formatAnswerValue(q, value) {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
    return <span className="kq-a-unanswered">Not provided</span>;
  }

  if (Array.isArray(value)) {
    return (
      <div className="kq-a-tag-list">
        {value.map((v) => (
          <span key={v} className="kq-a-pill">
            <Check size={12} className="pill-check-icon" />
            {v}
          </span>
        ))}
      </div>
    );
  }

  if (q.type === "number") {
    const num = Number(value);
    return isNaN(num) ? value : `$${num.toLocaleString()} USD`;
  }

  if (q.type === "date") {
    try {
      const d = new Date(value + (value.includes("T") ? "" : "T00:00:00"));
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      }
    } catch (_) {}
    return value;
  }

  return value;
}

/**
 * Dynamic input component for Draft / Edit mode
 */
function DynamicField({ question, value, onChange, disabled, error }) {
  const common = {
    id: question.id,
    name: question.id,
    value: value || "",
    required: question.required,
    disabled,
    onChange: (e) => onChange(e.target.value)
  };

  if (question.type === "textarea") {
    return (
      <div className={`input-wrapper ${error ? "has-error" : ""}`}>
        <textarea
          {...common}
          rows="4"
          placeholder="Please provide full details as required for legal review..."
          className="form-textarea"
        />
      </div>
    );
  }

  if (question.type === "dropdown") {
    return (
      <div className={`select-wrapper ${error ? "has-error" : ""}`}>
        <select {...common} className="form-select">
          <option value="">Select an option from list</option>
          {(question.options || []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (question.type === "radio") {
    return (
      <div className="choice-cards-grid" role="radiogroup" aria-labelledby={question.id}>
        {question.options.map((o) => {
          const checked = value === o;
          return (
            <label
              className={`choice-card radio-card ${checked ? "selected" : ""} ${disabled ? "disabled" : ""}`}
              key={o}
            >
              <input
                type="radio"
                name={question.id}
                value={o}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(o)}
              />
              <span className="choice-indicator-radio" />
              <span className="choice-card-label">{o}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === "checkbox") {
    const list = Array.isArray(value) ? value : [];
    return (
      <div className="choice-cards-grid" role="group" aria-labelledby={question.id}>
        {question.options.map((o) => {
          const checked = list.includes(o);
          return (
            <label
              className={`choice-card check-card ${checked ? "selected" : ""} ${disabled ? "disabled" : ""}`}
              key={o}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...list, o]
                      : list.filter((x) => x !== o)
                  )
                }
              />
              <span className="choice-indicator-check">
                {checked && <Check size={12} />}
              </span>
              <span className="choice-card-label">{o}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === "number") {
    return (
      <div className={`input-adorned-wrapper ${error ? "has-error" : ""}`}>
        <div className="input-adornment">
          <DollarSign size={16} />
        </div>
        <input
          {...common}
          type="number"
          placeholder="e.g. 500,000"
          className="form-input adorned"
          min="0"
          step="10000"
        />
        <div className="input-adornment-right">USD</div>
      </div>
    );
  }

  if (question.type === "date") {
    return (
      <div className={`input-adorned-wrapper ${error ? "has-error" : ""}`}>
        <div className="input-adornment">
          <Calendar size={16} />
        </div>
        <input
          {...common}
          type="date"
          className="form-input adorned"
        />
      </div>
    );
  }

  return (
    <div className={`input-wrapper ${error ? "has-error" : ""}`}>
      <input
        {...common}
        type={question.type}
        placeholder={question.placeholder || "Enter your response..."}
        className="form-input"
      />
    </div>
  );
}

export default function Questionnaire() {
  const { refresh, selectedAdvisor } = useApp();
  const [questions, setQuestions] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [review, setReview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [lastSaved, setLastSaved] = useState(null);

  /**
   * Load questions and submission data with dual-layer persistence (API + LocalStorage backup)
   */
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      let current = null;
      let localBackup = null;

      try {
        const stored = localStorage.getItem("dj_kq_submission_backup");
        if (stored) {
          localBackup = JSON.parse(stored);
        }
      } catch (lsErr) {
        console.warn("Could not read local questionnaire backup", lsErr);
      }

      try {
        const [q, s] = await Promise.all([getQuestions(), getSubmissions()]);
        setQuestions(q.data);

        if (Array.isArray(s.data) && s.data.length > 0) {
          // Sort by newest updated or created timestamp
          const sorted = [...s.data].sort((a, b) => {
            const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return timeB - timeA;
          });
          current = sorted[0];
        }
      } catch (apiErr) {
        console.warn("API load error, falling back to local data if present", apiErr);
      }

      // If local backup exists and is more recent, or API returned nothing/draft when submitted locally
      if (localBackup) {
        if (
          !current ||
          (localBackup.status !== "Draft" && current.status === "Draft") ||
          new Date(localBackup.updatedAt || 0) > new Date(current?.updatedAt || 0)
        ) {
          current = localBackup;
        }
      }

      if (current) {
        setSubmission(current);
        setAnswers(current.answers || {});
        if (current.updatedAt || current.submittedAt) {
          setLastSaved(
            new Date(current.updatedAt || current.submittedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          );
        }
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(
    () =>
      questions.filter(
        (q) =>
          !q.condition ||
          (answers[q.condition.questionId] || []).includes?.(q.condition.includes) ||
          answers[q.condition.questionId] === q.condition.equals
      ),
    [questions, answers]
  );

  const sectionQuestions = useMemo(
    () => visible.filter((q) => q.section === sections[step]),
    [visible, step]
  );

  const answeredCount = visible.filter((q) => {
    const v = answers[q.id];
    return Array.isArray(v) ? v.length > 0 : String(v ?? "").trim().length > 0;
  }).length;

  const progress = visible.length ? Math.round((answeredCount / visible.length) * 100) : 0;

  // Proper Questionnaire States
  const currentStatus = submission?.status || "Draft";
  const isSubmittedMode = ["Submitted", "Under Review", "Approved"].includes(currentStatus);
  const isClarification = currentStatus === "Clarification Required";
  const isDraft = currentStatus === "Draft" || !isSubmittedMode;

  const setAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validateField = (q, v) => {
    const empty = Array.isArray(v) ? !v.length : !String(v ?? "").trim();
    if (q.required && empty) return "This field is required for legal review.";
    if (q.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return "Please enter a valid business or personal email address.";
    }
    if (q.type === "number" && v && Number(v) <= 0) {
      return "Please enter a positive numeric capital amount.";
    }
    return null;
  };

  const validateCurrentSection = () => {
    const errs = {};
    sectionQuestions.forEach((q) => {
      const err = validateField(q, answers[q.id]);
      if (err) errs[q.id] = err;
    });
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAll = () => {
    const errs = {};
    let firstErrorStep = -1;

    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
      const sName = sections[sIdx];
      const questionsInSec = visible.filter((q) => q.section === sName);
      let secHasError = false;

      for (const q of questionsInSec) {
        const err = validateField(q, answers[q.id]);
        if (err) {
          errs[q.id] = err;
          secHasError = true;
        }
      }

      if (secHasError && firstErrorStep === -1) {
        firstErrorStep = sIdx;
      }
    }

    setFieldErrors(errs);

    if (firstErrorStep !== -1) {
      setStep(firstErrorStep);
      setToast({
        message: "Please complete all mandatory fields marked with an asterisk before submitting.",
        type: "error"
      });
      return false;
    }
    return true;
  };

  /**
   * Save draft or final submission with local backup and API sync
   */
  const save = async (targetStatus = "Draft") => {
    if (targetStatus !== "Draft" && !validateAll()) {
      return false;
    }

    setBusy(true);
    try {
      const now = new Date().toISOString();
      const updatedData = {
        ...(submission || {}),
        userId: "demo-investor-01",
        answers,
        progress: targetStatus === "Draft" ? progress : 100,
        status: targetStatus,
        updatedAt: now,
        createdAt: submission?.createdAt || now,
        submittedAt: targetStatus === "Submitted" ? (submission?.submittedAt || now) : submission?.submittedAt,
        reviewHistory: submission?.reviewHistory || [],
        clarificationQuestions: targetStatus === "Submitted" ? [] : (submission?.clarificationQuestions || [])
      };

      // 1. Immediately store in localStorage so data NEVER disappears
      try {
        localStorage.setItem("dj_kq_submission_backup", JSON.stringify(updatedData));
      } catch (lsErr) {
        console.warn("Could not save to localStorage", lsErr);
      }

      // 2. Sync to API / Database
      let persisted = updatedData;
      try {
        let response;
        if (submission?.id) {
          response = await replaceSubmission(submission.id, updatedData);
        } else {
          response = await createSubmission(updatedData);
        }
        if (response?.data) {
          persisted = response.data;
          localStorage.setItem("dj_kq_submission_backup", JSON.stringify(persisted));
        }
      } catch (apiErr) {
        console.warn("API sync encountered issue; local persistence preserved", apiErr);
      }

      setSubmission(persisted);
      setAnswers(persisted.answers || answers);
      setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

      if (targetStatus === "Submitted") {
        try {
          await addActivity({
            title: "Questionnaire submitted for review",
            description: "Investor responses successfully submitted to immigration legal team.",
            date: now,
            type: "questionnaire"
          });
        } catch (_) {}
        setToast({
          message: "K&Q Questionnaire submitted successfully. Answers are now locked in read-only mode.",
          type: "success"
        });
      } else {
        try {
          await addActivity({
            title: "Questionnaire draft saved",
            description: `Progress updated to ${progress}% across application sections.`,
            date: now,
            type: "questionnaire"
          });
        } catch (_) {}
        setToast({
          message: `Draft responses saved securely (${progress}% complete).`,
          type: "success"
        });
      }

      try {
        await refresh();
      } catch (_) {}
      return true;
    } catch (e) {
      setToast({
        message: getErrorMessage(e),
        type: "error"
      });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    const success = await save("Submitted");
    if (success) {
      setReview(false);
    }
  };

  /**
   * Demo reviewer state switcher to easily verify all 4 states (Draft, Submitted, Under Review, Approved)
   */
  const simulateStateTransition = async (newStatus, clarificationList = []) => {
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const updated = {
        ...(submission || {}),
        userId: "demo-investor-01",
        answers,
        status: newStatus,
        updatedAt: now,
        clarificationQuestions: clarificationList
      };

      try {
        localStorage.setItem("dj_kq_submission_backup", JSON.stringify(updated));
      } catch (_) {}

      if (submission?.id) {
        try {
          const res = await patchSubmission(submission.id, {
            status: newStatus,
            clarificationQuestions: clarificationList,
            updatedAt: now
          });
          if (res?.data) {
            setSubmission(res.data);
            localStorage.setItem("dj_kq_submission_backup", JSON.stringify(res.data));
          }
        } catch (_) {
          setSubmission(updated);
        }
      } else {
        setSubmission(updated);
      }

      try {
        await addActivity({
          title: `Status Transition: ${newStatus}`,
          description: `Questionnaire evaluation state transitioned to ${newStatus}.`,
          date: now,
          type: "questionnaire"
        });
        await refresh();
      } catch (_) {}

      setToast({
        message: `Workflow state updated to "${newStatus}".`,
        type: "info"
      });
    } catch (e) {
      setToast({
        message: getErrorMessage(e),
        type: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  const formattedSubmissionDate = useMemo(() => {
    const raw = submission?.submittedAt || submission?.updatedAt;
    if (!raw) return "November 4, 2026";
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return "November 4, 2026";
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (_) {
      return "November 4, 2026";
    }
  }, [submission]);

  if (loading) return <Loading label="Loading questionnaire configuration..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <PageTitle
        eyebrow="ONBOARDING COMPLIANCE"
        title="Know Your Customer (K&Q)"
        description="Provide comprehensive background and capital source details for cross-border immigration eligibility."
        action={
          <div className="status-header-wrap">
            <StatusBadge status={currentStatus} />
            {lastSaved && <span className="last-saved-tag">Saved at {lastSaved}</span>}
          </div>
        }
      />

      {/* ======================================================================
          SUBMITTED / UNDER REVIEW / APPROVED: 100% READ-ONLY ORGANIZED VIEW
          Zero Edit buttons. Complete answers visible permanently across reloads.
          ====================================================================== */}
      {isSubmittedMode && (
        <div className="kq-submitted-view">
          {/* 1. Executive Submission Status Confirmation Banner */}
          <div className="kq-submission-banner">
            <div className="kq-banner-top">
              <div className="kq-banner-header-left">
                <div className="kq-status-icon-circle">
                  {currentStatus === "Approved" ? (
                    <CheckCircle2 size={26} />
                  ) : (
                    <ShieldCheck size={26} />
                  )}
                </div>
                <div>
                  <h3 className="kq-banner-title">
                    {currentStatus === "Approved"
                      ? "K&Q Questionnaire Officially Approved"
                      : currentStatus === "Under Review"
                      ? "K&Q Questionnaire Currently Under Legal Review"
                      : "K&Q Questionnaire Successfully Submitted"}
                  </h3>
                  <div className="kq-banner-meta">
                    <span className="kq-banner-meta-item">
                      <Calendar size={13} />
                      <span>Submitted on {formattedSubmissionDate}</span>
                    </span>
                    <span>•</span>
                    <span className="kq-banner-meta-item">
                      <FileCheck2 size={13} />
                      <span>Ref: #DJ-KQ-{submission?.id || "2026-01"}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="kq-banner-badges">
                <StatusBadge status={currentStatus} />
                <span className="kq-locked-pill">
                  <LockKeyhole size={12} /> Read-Only Locked
                </span>
              </div>
            </div>

            <p className="kq-banner-desc">
              {currentStatus === "Approved"
                ? "Your compliance records have been thoroughly reviewed and formally certified by licensed legal counsel. All onboarding criteria have been satisfied."
                : currentStatus === "Under Review"
                ? "Your designated legal counsel is currently assessing your background statements and capital source verification. All answers are displayed below in read-only format."
                : "Your K&Q questionnaire responses have been received and locked for institutional compliance. To preserve regulatory audit integrity, editing is disabled. Your designated immigration attorney will evaluate these records."}
            </p>
          </div>

          {/* 2. Key Summary Metric Cards */}
          <div className="kq-summary-kpis">
            <div className="kq-kpi-card">
              <span className="kq-kpi-label">APPLICATION STATUS</span>
              <div className="kq-kpi-value">{currentStatus}</div>
              <span className="kq-kpi-note">100% Complete & Verified</span>
            </div>

            <div className="kq-kpi-card">
              <span className="kq-kpi-label">TOTAL ANSWERS</span>
              <div className="kq-kpi-value">{visible.length} of {visible.length} Recorded</div>
              <span className="kq-kpi-note">All 4 sections complete</span>
            </div>

            <div className="kq-kpi-card">
              <span className="kq-kpi-label">PRIMARY OBJECTIVE</span>
              <div className="kq-kpi-value" style={{ fontSize: "14.5px" }}>
                {answers["q5"] || "Permanent residency"}
              </div>
              <span className="kq-kpi-note">
                Timeline: {answers["q6"] || "Standard"}
              </span>
            </div>

            <div className="kq-kpi-card">
              <span className="kq-kpi-label">DECLARED CAPITAL</span>
              <div className="kq-kpi-value" style={{ color: "#16a34a" }}>
                {answers["q7"] ? `$${Number(answers["q7"]).toLocaleString()} USD` : "$500,000+ USD"}
              </div>
              <span className="kq-kpi-note">Designated Investor Pool</span>
            </div>
          </div>

          {/* 3. All Completed Sections & Answers Displayed (Organized Cards) */}
          <div className="kq-sections-stack">
            {sections.map((secName, sIdx) => {
              const secQuestions = visible.filter((q) => q.section === secName);
              if (!secQuestions.length) return null;

              return (
                <div className="kq-section-card" key={secName}>
                  <div className="kq-section-header">
                    <div className="kq-section-title-wrap">
                      <span className="kq-section-step-num">0{sIdx + 1}</span>
                      <div>
                        <h4 className="kq-section-title">{secName}</h4>
                        <span className="kq-section-desc">{sectionDescriptions[secName]}</span>
                      </div>
                    </div>
                    <span className="kq-section-status-tag">
                      <Check size={13} /> Completed
                    </span>
                  </div>

                  <div className="kq-qa-grid">
                    {secQuestions.map((q) => {
                      const ans = answers[q.id];
                      const isFull = q.type === "textarea" || (Array.isArray(ans) && ans.length > 2);

                      return (
                        <div className={`kq-qa-card ${isFull ? "full-width" : ""}`} key={q.id}>
                          <span className="kq-q-label">{q.label}</span>
                          <div className="kq-a-value">
                            {formatAnswerValue(q, ans)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Demo Testing Toolbar (Allows testing all 4 states without code changes) */}
          <div className="kq-demo-toolbar">
            <div className="kq-demo-toolbar-left">
              <Sparkles size={16} className="text-gold" />
              <div>
                <span className="kq-demo-label">Review State Simulator</span>
                <span className="kq-demo-sub"> — Test mock legal workflow transitions</span>
              </div>
            </div>

            <div className="kq-demo-buttons">
              {currentStatus !== "Submitted" && (
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  disabled={busy}
                  onClick={() => simulateStateTransition("Submitted")}
                >
                  View as Submitted
                </button>
              )}

              {currentStatus !== "Under Review" && (
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  disabled={busy}
                  onClick={() => simulateStateTransition("Under Review")}
                >
                  View as Under Review
                </button>
              )}

              {currentStatus !== "Approved" && (
                <button
                  type="button"
                  className="btn btn-primary btn-small"
                  disabled={busy}
                  onClick={() => simulateStateTransition("Approved")}
                >
                  <CheckCircle2 size={13} /> View as Approved
                </button>
              )}

              <button
                type="button"
                className="btn btn-ghost btn-small"
                disabled={busy}
                onClick={() => simulateStateTransition("Draft")}
                title="Reset to draft mode to test re-entering and editing"
              >
                <RotateCcw size={13} /> Reset to Draft (Test Form)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          DRAFT STATE: INTERACTIVE FORM & SUBMISSION FLOW
          Editable fields, Save Progress, Review before submit
          ====================================================================== */}
      {isDraft && (
        <div className="question-layout">
          {/* Left Stepper Sidebar */}
          <aside className="panel step-panel">
            <div className="step-panel-head">
              <span className="eyebrow">APPLICATION SECTIONS</span>
              <h3>Progress Stepper</h3>
            </div>

            <div className="step-list">
              {sections.map((s, i) => {
                const isCurrent = step === i;
                const isPast = step > i;
                return (
                  <button
                    key={s}
                    type="button"
                    className={`step-item ${isCurrent ? "current" : ""} ${isPast ? "done" : ""}`}
                    onClick={() => setStep(i)}
                  >
                    <div className="step-indicator">
                      {isPast ? <Check size={14} /> : <span>0{i + 1}</span>}
                    </div>
                    <div className="step-item-text">
                      <span className="step-num-label">Step {i + 1}</span>
                      <strong className="step-name">{s}</strong>
                    </div>
                    {isCurrent && <div className="step-active-pill" />}
                  </button>
                );
              })}
            </div>

            <div className="progress-summary-card">
              <div className="progress-top-row">
                <span className="p-title">Overall Completion</span>
                <strong className="p-percentage">{progress}%</strong>
              </div>
              <div className="progress-track-large">
                <span style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-meta-text">
                <FileCheck2 size={14} />
                <span>
                  {answeredCount} of {visible.length} questions answered
                </span>
              </div>
            </div>
          </aside>

          {/* Right Questions Form Panel */}
          <section className="panel question-panel">
            <div className="question-panel-head">
              <div>
                <div className="step-badge-tag">
                  SECTION 0{step + 1} OF 0{sections.length}
                </div>
                <h2>{sections[step]}</h2>
                <p className="section-desc">{sectionDescriptions[sections[step]]}</p>
              </div>
              <span className="subtle-tag">{sectionQuestions.length} Questions</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (validateCurrentSection()) {
                  if (step < sections.length - 1) {
                    setStep((s) => s + 1);
                  } else {
                    setReview(true);
                  }
                }
              }}
              className="questions-form"
            >
              <div className="questions-list">
                {sectionQuestions.map((q) => (
                  <div className={`form-field ${fieldErrors[q.id] ? "field-has-error" : ""}`} key={q.id}>
                    <label htmlFor={q.id} className="field-label">
                      <span>{q.label}</span>
                      {q.required ? (
                        <span className="required-indicator" title="Required field">*</span>
                      ) : (
                        <span className="optional-tag">(Optional)</span>
                      )}
                    </label>

                    <DynamicField
                      question={q}
                      value={answers[q.id]}
                      onChange={(v) => setAnswer(q.id, v)}
                      disabled={false}
                      error={fieldErrors[q.id]}
                    />

                    {fieldErrors[q.id] && (
                      <div className="field-error-message">
                        <AlertCircle size={14} />
                        <span>{fieldErrors[q.id]}</span>
                      </div>
                    )}
                  </div>
                ))}

                {!sectionQuestions.length && (
                  <div className="empty-section-notice">
                    <Info size={18} />
                    <span>No questions applicable in this section under current criteria.</span>
                  </div>
                )}
              </div>

              <div className="form-footer-bar">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={step === 0}
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ChevronLeft size={16} /> Previous Section
                </button>

                <div className="form-actions-cluster">
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={busy}
                    onClick={() => save("Draft")}
                  >
                    <Save size={16} /> Save Draft
                  </button>

                  {step < sections.length - 1 ? (
                    <button type="submit" className="btn btn-primary">
                      Next Section <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary btn-gold-solid">
                      <Eye size={16} /> Review & Submit
                    </button>
                  )}
                </div>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Review Modal (Prior to final submission) */}
      {review && (
        <Modal
          title="Review Your Responses"
          subtitle="Carefully verify your investor statements prior to official advisor submission."
          onClose={() => setReview(false)}
          maxWidth="680px"
        >
          <div className="review-scroll-container">
            <div className="review-summary-banner">
              <CheckCircle2 size={18} />
              <span>
                All required sections are completed. Once submitted, your questionnaire will be locked in read-only mode for official legal review.
              </span>
            </div>

            <div className="review-cards-list">
              {visible.map((q) => {
                const ans = answers[q.id];
                const hasValue = Array.isArray(ans) ? ans.length > 0 : String(ans ?? "").trim().length > 0;

                return (
                  <div className="review-card-item" key={q.id}>
                    <div className="review-question-label">
                      <span className="review-sec-tag">{q.section}</span>
                      <strong>{q.label}</strong>
                    </div>
                    <div className="review-answer-value">
                      {hasValue ? (
                        Array.isArray(ans) ? (
                          <div className="review-tags-wrap">
                            {ans.map((tag) => (
                              <span key={tag} className="review-val-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : q.type === "number" ? (
                          <b>${Number(ans).toLocaleString()} USD</b>
                        ) : (
                          <b>{ans}</b>
                        )
                      ) : (
                        <span className="review-unanswered">Not answered</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setReview(false)}
              disabled={busy}
            >
              Return to Editing
            </button>
            <button
              type="button"
              className="btn btn-primary btn-gold-solid"
              disabled={busy}
              onClick={submit}
            >
              <Send size={16} /> Confirm & Submit Questionnaire
            </button>
          </div>
        </Modal>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
