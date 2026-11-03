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
  CheckCircle2
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
import { PageTitle, StatusBadge, Loading, ErrorState, Modal, Toast } from "../components/UI";

const sections = [
  "Personal information",
  "Immigration objectives",
  "Investment readiness",
  "Source of funds"
];

function DynamicField({ question, value, onChange, disabled }) {
  const common = {
    id: question.id,
    name: question.id,
    value: value || "",
    required: question.required,
    disabled,
    onChange: (e) => onChange(e.target.value)
  };

  if (question.type === "textarea") {
    return <textarea {...common} rows="3" placeholder="Enter your response..." />;
  }
  if (question.type === "dropdown") {
    return (
      <select {...common}>
        <option value="">Select an option</option>
        {(question.options || []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  if (question.type === "radio") {
    return (
      <div className="choice-list" role="radiogroup" aria-labelledby={question.id}>
        {question.options.map((o) => (
          <label className="choice-option" key={o}>
            <input
              type="radio"
              name={question.id}
              value={o}
              checked={value === o}
              disabled={disabled}
              onChange={() => onChange(o)}
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
    );
  }
  if (question.type === "checkbox") {
    const list = Array.isArray(value) ? value : [];
    return (
      <div className="choice-list choice-wrap">
        {question.options.map((o) => (
          <label className="choice-option" key={o}>
            <input
              type="checkbox"
              checked={list.includes(o)}
              disabled={disabled}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...list, o]
                    : list.filter((x) => x !== o)
                )
              }
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
    );
  }
  return (
    <input
      {...common}
      type={question.type}
      placeholder={question.type === "number" ? "Enter amount in USD" : "Enter your response"}
    />
  );
}

export default function Questionnaire() {
  const { refresh } = useApp();
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

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [q, s] = await Promise.all([getQuestions(), getSubmissions()]);
      setQuestions(q.data);
      const current = s.data[0] || null;
      setSubmission(current);
      setAnswers(current?.answers || {});
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
  const locked = ["Submitted", "Approved"].includes(submission?.status);
  const isClarification = submission?.status === "Clarification Required";
  const editable = !locked;

  const setAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validateField = (q, v) => {
    const empty = Array.isArray(v) ? !v.length : !String(v ?? "").trim();
    if (q.required && empty) return "This field is required.";
    if (q.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return "Enter a valid email address.";
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
        message: "Please fill out all required fields before submitting.",
        type: "error"
      });
      return false;
    }
    return true;
  };

  const save = async (status = "Draft") => {
    if (status !== "Draft" && !validateAll()) {
      return false;
    }

    setBusy(true);
    try {
      const data = {
        ...(submission || {}),
        userId: "demo-investor-01",
        answers,
        progress,
        status,
        updatedAt: new Date().toISOString(),
        createdAt: submission?.createdAt || new Date().toISOString(),
        reviewHistory: submission?.reviewHistory || [],
        clarificationQuestions:
          status === "Submitted" ? [] : submission?.clarificationQuestions || []
      };

      let response;
      if (submission?.id) {
        response = await replaceSubmission(submission.id, data);
      } else {
        response = await createSubmission(data);
      }
      setSubmission(response.data);

      if (status === "Submitted") {
        await addActivity({
          title: "Questionnaire submitted",
          description: "Your K&Q responses were submitted for mock advisor review.",
          date: new Date().toISOString(),
          type: "questionnaire"
        });
        setToast({
          message: "Questionnaire submitted successfully for advisor review.",
          type: "success"
        });
      } else {
        await addActivity({
          title: "Questionnaire draft saved",
          description: `Your progress is saved at ${progress}%.`,
          date: new Date().toISOString(),
          type: "questionnaire"
        });
        setToast({
          message: `Draft saved successfully (${progress}% completed).`,
          type: "success"
        });
      }

      await refresh();
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

  // Demo simulator for Advisor review and clarification (Tests PATCH method)
  const simulateAdvisorAction = async (newStatus, clarificationList = []) => {
    if (!submission?.id) return;
    setBusy(true);
    try {
      const patchData = {
        status: newStatus,
        clarificationQuestions: clarificationList,
        updatedAt: new Date().toISOString()
      };
      const response = await patchSubmission(submission.id, patchData);
      setSubmission(response.data);

      let activityTitle = `Advisor status: ${newStatus}`;
      let activityDesc = `Questionnaire status changed to ${newStatus}.`;

      if (newStatus === "Clarification Required") {
        activityTitle = "Advisor requested clarifications";
        activityDesc = `Advisor flagged ${clarificationList.length} items for revision.`;
      } else if (newStatus === "Approved") {
        activityTitle = "Questionnaire approved";
        activityDesc = "Advisor reviewed and verified your investor profile.";
      } else if (newStatus === "Draft") {
        activityTitle = "Questionnaire reverted to draft";
        activityDesc = "Demo profile reset to draft state for testing.";
      }

      await addActivity({
        title: activityTitle,
        description: activityDesc,
        date: new Date().toISOString(),
        type: "questionnaire"
      });

      await refresh();
      setToast({
        message: `Simulation applied: Status changed to "${newStatus}".`,
        type: "success"
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

  if (loading) return <Loading label="Loading questionnaire configuration" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!questions.length) {
    return (
      <div className="panel">
        <h3>No questions configured</h3>
        <p>Add question records to the JSON Server questions collection.</p>
      </div>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="INVESTOR PROFILE"
        title="K&Q questionnaire"
        description="Tell us about your background, immigration objectives and investment readiness."
        action={<StatusBadge status={submission?.status || "Draft"} />}
      />

      {isClarification && (
        <div className="notice notice-gold">
          <MessageSquareText size={20} />
          <div>
            <b>Additional information requested by advisor</b>
            <p>
              Your advisor has reviewed your responses and requested clarifications. Please
              update your responses below and click "Resubmit questionnaire".
            </p>
            {submission?.clarificationQuestions?.length > 0 && (
              <ul className="clarification-list">
                {submission.clarificationQuestions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {locked && (
        <div className="notice">
          <LockKeyhole size={18} />
          <div>
            <b>Editing is locked ({submission?.status})</b>
            <p>
              Your submission has been sent for advisor review. Standard editing is paused. You
              can test the advisor workflow using the simulation bar below.
            </p>
          </div>
        </div>
      )}

      {/* Demo Advisor Workflow Simulation Bar (Demonstrates PATCH method and Clarification cycle) */}
      <div className="demo-simulation-bar">
        <div className="demo-sim-info">
          <Sparkles size={16} />
          <span>
            <b>Demo Advisor Controls:</b> Test approval, clarification & resubmission
          </span>
        </div>
        <div className="demo-sim-buttons">
          {submission?.status === "Submitted" && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                disabled={busy}
                onClick={() =>
                  simulateAdvisorAction("Clarification Required", [
                    "Please provide documentary explanation of other source of funds (Section 4).",
                    "Please verify your timeline and expected investment range."
                  ])
                }
              >
                <MessageSquareText size={14} /> Request clarification
              </button>
              <button
                type="button"
                className="btn btn-primary btn-small"
                disabled={busy}
                onClick={() => simulateAdvisorAction("Approved", [])}
              >
                <CheckCircle2 size={14} /> Approve questionnaire
              </button>
            </>
          )}

          {submission?.status === "Clarification Required" && (
            <button
              type="button"
              className="btn btn-primary btn-small"
              disabled={busy}
              onClick={() => submit()}
            >
              <Send size={14} /> Resubmit questionnaire
            </button>
          )}

          {["Submitted", "Approved", "Clarification Required"].includes(submission?.status) && (
            <button
              type="button"
              className="btn btn-ghost btn-small"
              disabled={busy}
              onClick={() => simulateAdvisorAction("Draft", [])}
            >
              <RotateCcw size={14} /> Reset to draft
            </button>
          )}
        </div>
      </div>

      <div className="question-layout">
        <aside className="panel step-panel">
          <span className="eyebrow">QUESTIONNAIRE</span>
          <h3>Application steps</h3>
          <div className="step-list">
            {sections.map((s, i) => (
              <button
                key={s}
                type="button"
                className={`step-item ${step === i ? "current" : ""} ${step > i ? "done" : ""}`}
                onClick={() => setStep(i)}
              >
                <span className="step-count">{step > i ? <Check size={14} /> : `0${i + 1}`}</span>
                <span>{s}</span>
              </button>
            ))}
          </div>
          <div className="progress-summary">
            <div className="progress-top">
              <span>Overall progress</span>
              <b>{progress}%</b>
            </div>
            <div className="progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
            <small>
              {answeredCount} of {visible.length} answered
            </small>
          </div>
        </aside>

        <section className="panel question-panel">
          <div className="question-panel-head">
            <div>
              <span className="eyebrow">
                SECTION 0{step + 1} / 0{sections.length}
              </span>
              <h2>{sections[step]}</h2>
              <p>Fields marked with an asterisk (*) are required.</p>
            </div>
            <span className="subtle-tag">{sectionQuestions.length} questions</span>
          </div>

          {sectionQuestions.map((q) => (
            <div className="form-field" key={q.id}>
              <label htmlFor={q.id}>
                {q.label}
                {q.required && <em> *</em>}
              </label>
              <DynamicField
                question={q}
                value={answers[q.id]}
                onChange={(v) => setAnswer(q.id, v)}
                disabled={!editable}
              />
              {fieldErrors[q.id] && <small className="field-error">{fieldErrors[q.id]}</small>}
            </div>
          ))}

          {!sectionQuestions.length && (
            <p className="muted-small">
              No visible questions in this section based on your current answers.
            </p>
          )}

          <div className="form-footer">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <div className="form-actions">
              {editable && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={busy}
                  onClick={() => save("Draft")}
                >
                  <Save size={16} /> Save draft
                </button>
              )}

              {step < sections.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => validateCurrentSection() && setStep((s) => s + 1)}
                >
                  Next section <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (validateCurrentSection()) {
                      setReview(true);
                    }
                  }}
                >
                  <Eye size={16} /> Review answers
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />

      {review && (
        <Modal
          title="Review your answers"
          subtitle="Check your responses before submitting for advisor evaluation."
          onClose={() => setReview(false)}
        >
          <div className="review-list">
            {visible.map((q) => (
              <div className="review-row" key={q.id}>
                <span>{q.label}</span>
                <b>
                  {Array.isArray(answers[q.id])
                    ? answers[q.id].join(", ")
                    : answers[q.id] || <i style={{ color: "#a0aab5" }}>Not answered</i>}
                </b>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setReview(false)}
            >
              Back to edit
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || !editable}
              onClick={submit}
            >
              <Send size={16} /> Submit questionnaire
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
