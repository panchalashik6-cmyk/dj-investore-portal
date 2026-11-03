import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarPlus,
  CalendarDays,
  Clock3,
  Trash2,
  Eye,
  AlertTriangle,
  XCircle,
  CheckCircle2
} from "lucide-react";
import {
  createMeeting,
  patchMeeting,
  deleteMeeting,
  addActivity,
  getErrorMessage
} from "../api/client";
import { useApp } from "../context/AppContext";
import { PageTitle, StatusBadge, Loading, ErrorState, EmptyState, Modal, Toast } from "../components/UI";

const slots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"];

export default function Meetings() {
  const { meetings, advisors, selectedAdvisor, loading, apiError, refresh } = useApp();
  const [form, setForm] = useState({
    date: "",
    time: "",
    purpose: "Initial consultation",
    message: ""
  });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("All");
  const [detail, setDetail] = useState(null);
  const [cancel, setCancel] = useState(null);
  const [remove, setRemove] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const visible = meetings
    .filter((m) => filter === "All" || m.status === filter)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const advisorFor = (id) => advisors.find((a) => String(a.id) === String(id));

  const request = async (e) => {
    e.preventDefault();

    if (!selectedAdvisor) {
      setToast({
        message: "Please select an advisor before requesting a consultation.",
        type: "error"
      });
      return;
    }

    if (!form.date || !form.time) {
      setToast({
        message: "Please select a date and an available time slot.",
        type: "error"
      });
      return;
    }

    if (form.date < today) {
      setToast({
        message: "Selected date is in the past. Please select today or a future date.",
        type: "error"
      });
      return;
    }

    // Check duplicate slot for this advisor
    const advisorConflict = meetings.some(
      (m) =>
        String(m.advisorId) === String(selectedAdvisor.id) &&
        m.date === form.date &&
        m.time === form.time &&
        m.status !== "CANCELLED"
    );

    if (advisorConflict) {
      setToast({
        message: `${selectedAdvisor.name} already has a consultation scheduled for this date and time slot. Please choose another slot.`,
        type: "error"
      });
      return;
    }

    // Check conflict on user's own schedule
    const userConflict = meetings.some(
      (m) =>
        m.date === form.date &&
        m.time === form.time &&
        m.status !== "CANCELLED"
    );

    if (userConflict) {
      setToast({
        message: "You already have another meeting scheduled for that date and time slot. Please choose a different time.",
        type: "error"
      });
      return;
    }

    setBusy(true);
    try {
      await createMeeting({
        ...form,
        advisorId: selectedAdvisor.id,
        status: "REQUESTED",
        createdAt: new Date().toISOString()
      });

      await addActivity({
        title: "Meeting requested",
        description: `A consultation request was sent to ${selectedAdvisor.name} for ${form.date} at ${form.time}.`,
        date: new Date().toISOString(),
        type: "meeting"
      });

      setForm({
        date: "",
        time: "",
        purpose: "Initial consultation",
        message: ""
      });

      setToast({
        message: "Meeting request submitted successfully.",
        type: "success"
      });

      await refresh();
    } catch (e) {
      setToast({
        message: getErrorMessage(e),
        type: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async (m, status) => {
    setBusy(true);
    try {
      await patchMeeting(m.id, {
        status,
        updatedAt: new Date().toISOString()
      });

      await addActivity({
        title: `Meeting ${status.toLowerCase()}`,
        description: `The meeting scheduled for ${m.date} at ${m.time} was marked ${status}.`,
        date: new Date().toISOString(),
        type: "meeting"
      });

      setCancel(null);
      setDetail(null);
      setToast({
        message: `Meeting marked as ${status}.`,
        type: "success"
      });

      await refresh();
    } catch (e) {
      setToast({
        message: getErrorMessage(e),
        type: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  const removeMeeting = async () => {
    if (!remove) return;
    setBusy(true);
    try {
      await deleteMeeting(remove.id);
      await addActivity({
        title: "Meeting record deleted",
        description: `The cancelled meeting scheduled for ${remove.date} at ${remove.time} was permanently removed.`,
        date: new Date().toISOString(),
        type: "meeting"
      });

      setRemove(null);
      setToast({
        message: "Cancelled meeting record permanently deleted.",
        type: "success"
      });

      await refresh();
    } catch (e) {
      setToast({
        message: getErrorMessage(e),
        type: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading label="Loading meeting records" />;
  if (apiError) return <ErrorState message={apiError} onRetry={refresh} />;

  return (
    <>
      <PageTitle
        eyebrow="CONSULTATION PLANNING"
        title="Meetings"
        description="Request a conversation with your selected advisor and follow its status."
        action={<span className="subtle-tag">{meetings.length} meeting records</span>}
      />

      <div className="meeting-layout">
        <section className="panel meeting-form-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">NEW REQUEST</span>
              <h3>Request a meeting</h3>
            </div>
            <div className="form-icon">
              <CalendarPlus size={19} />
            </div>
          </div>

          {selectedAdvisor ? (
            <div className="chosen-advisor">
              <div className="avatar avatar-gold">{selectedAdvisor.initials}</div>
              <div>
                <small>MEETING WITH</small>
                <b>{selectedAdvisor.name}</b>
                <span>{selectedAdvisor.role}</span>
              </div>
            </div>
          ) : (
            <div className="notice notice-gold">
              <AlertTriangle size={17} />
              <div>
                <span>Select an advisor before creating a meeting request. </span>
                <Link to="/advisors" style={{ fontWeight: 700, textDecoration: "underline" }}>
                  Browse advisors
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={request} className="meeting-form">
            <div className="form-field">
              <label htmlFor="meeting-date">
                Meeting date <em>*</em>
              </label>
              <input
                id="meeting-date"
                type="date"
                min={today}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="meeting-time">
                Available mock time slot <em>*</em>
              </label>
              <select
                id="meeting-time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              >
                <option value="">Choose a time</option>
                {slots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="meeting-purpose">Meeting purpose</label>
              <select
                id="meeting-purpose"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              >
                <option>Initial consultation</option>
                <option>Investment discussion</option>
                <option>Document review</option>
                <option>Application progress update</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="meeting-message">
                Message <span className="optional">(optional)</span>
              </label>
              <textarea
                id="meeting-message"
                rows="3"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Add context for your advisor..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary full-btn"
              disabled={busy || !selectedAdvisor}
            >
              {busy ? "Submitting request..." : "Request meeting"} <CalendarPlus size={16} />
            </button>
            <small className="form-footnote">
              Demo time slots only. This does not create an external calendar appointment.
            </small>
          </form>
        </section>

        <section className="panel meeting-list-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR SCHEDULE</span>
              <h3>Meeting records</h3>
            </div>
            <select
              className="compact-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter meetings by status"
            >
              <option value="All">All statuses</option>
              <option value="REQUESTED">REQUESTED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {!visible.length ? (
            <EmptyState
              title="No meetings found"
              description="Your meeting requests will appear here once created."
            />
          ) : (
            <div className="meeting-list">
              {visible.map((m) => (
                <article className="meeting-row" key={m.id}>
                  <div className="meeting-date-tile">
                    <b>{new Date(m.date + "T00:00:00").getDate()}</b>
                    <span>
                      {new Date(m.date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short"
                      })}
                    </span>
                  </div>
                  <div className="meeting-info">
                    <b>{m.purpose}</b>
                    <span>
                      {advisorFor(m.advisorId)?.name || "Advisor"} · {m.time}
                    </span>
                    <small>
                      <CalendarDays size={13} />
                      {new Date(m.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </small>
                  </div>
                  <div className="meeting-row-actions">
                    <StatusBadge status={m.status} />
                    <button
                      type="button"
                      className="icon-btn"
                      title="View details"
                      aria-label="View meeting details"
                      onClick={() => setDetail(m)}
                    >
                      <Eye size={16} />
                    </button>
                    {m.status !== "CANCELLED" && m.status !== "COMPLETED" && (
                      <button
                        type="button"
                        className="icon-btn danger-icon"
                        title="Cancel meeting"
                        aria-label="Cancel meeting"
                        onClick={() => setCancel(m)}
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                    {m.status === "CANCELLED" && (
                      <button
                        type="button"
                        className="icon-btn danger-icon"
                        title="Delete demo record"
                        aria-label="Delete demo record"
                        onClick={() => setRemove(m)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="notice notice-info">
        <Clock3 size={17} />
        <span>
          <b>Scheduling note:</b> Concurrency and slot checks run against mock records stored in
          the demo JSON Server.
        </span>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />

      {detail && (
        <Modal
          title="Meeting details"
          subtitle="Consultation appointment record"
          onClose={() => setDetail(null)}
        >
          <div className="review-list">
            <div className="review-row">
              <span>Advisor</span>
              <b>{advisorFor(detail.advisorId)?.name || "Advisor"}</b>
            </div>
            <div className="review-row">
              <span>Date</span>
              <b>
                {new Date(detail.date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </b>
            </div>
            <div className="review-row">
              <span>Time</span>
              <b>{detail.time}</b>
            </div>
            <div className="review-row">
              <span>Purpose</span>
              <b>{detail.purpose}</b>
            </div>
            <div className="review-row">
              <span>Message</span>
              <b>{detail.message || "No notes provided"}</b>
            </div>
            <div className="review-row">
              <span>Status</span>
              <StatusBadge status={detail.status} />
            </div>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDetail(null)}
            >
              Close
            </button>
            {detail.status === "REQUESTED" && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => updateStatus(detail, "CONFIRMED")}
              >
                <CheckCircle2 size={14} /> Mock confirm
              </button>
            )}
            {detail.status === "CONFIRMED" && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => updateStatus(detail, "COMPLETED")}
              >
                <CheckCircle2 size={14} /> Mark completed
              </button>
            )}
            {detail.status !== "CANCELLED" && detail.status !== "COMPLETED" && (
              <button
                type="button"
                className="btn btn-danger"
                disabled={busy}
                onClick={() => {
                  const m = detail;
                  setDetail(null);
                  setCancel(m);
                }}
              >
                Cancel meeting
              </button>
            )}
          </div>
        </Modal>
      )}

      {cancel && (
        <Modal
          title="Cancel this meeting?"
          subtitle="The record will remain in your history with CANCELLED status."
          onClose={() => setCancel(null)}
        >
          <p className="modal-copy">
            Are you sure you want to cancel your consultation for <b>{cancel.purpose}</b> with{" "}
            <b>{advisorFor(cancel.advisorId)?.name || "Advisor"}</b> on {cancel.date} at{" "}
            {cancel.time}?
          </p>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCancel(null)}
            >
              Keep meeting
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={busy}
              onClick={() => updateStatus(cancel, "CANCELLED")}
            >
              {busy ? "Cancelling..." : "Confirm cancellation"}
            </button>
          </div>
        </Modal>
      )}

      {remove && (
        <Modal
          title="Delete demo record?"
          subtitle="This action permanently removes the cancelled mock record."
          onClose={() => setRemove(null)}
        >
          <p className="modal-copy">
            Permanently delete this cancelled meeting record for <b>{remove.purpose}</b> on{" "}
            {remove.date} at {remove.time}? This action cannot be undone.
          </p>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setRemove(null)}
            >
              Go back
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={busy}
              onClick={removeMeeting}
            >
              {busy ? "Deleting..." : "Delete record"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
