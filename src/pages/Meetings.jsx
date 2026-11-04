import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarPlus,
  CalendarDays,
  Clock3,
  Trash2,
  Eye,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  UserCheck,
  CalendarCheck2,
  Search,
  Filter,
  Check,
  Info,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import {
  createMeeting,
  patchMeeting,
  deleteMeeting,
  addActivity,
  getErrorMessage
} from "../api/client";
import { useApp } from "../context/AppContext";
import {
  PageTitle,
  StatusBadge,
  Loading,
  ErrorState,
  EmptyState,
  Modal,
  ConfirmModal,
  Toast,
  AdvisorAvatar
} from "../components/UI";

const availableSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:30 PM"
];

const meetingPurposes = [
  "Initial residency consultation",
  "Investment pathway & fund review",
  "Asset & source of funds verification",
  "Family relocation & schooling inquiry",
  "Formal application progress briefing",
  "Other legal inquiry"
];

export default function Meetings() {
  const { meetings = [], advisors = [], selectedAdvisor, loading, apiError, refresh } = useApp();
  const [form, setForm] = useState({
    date: "",
    time: "",
    purpose: meetingPurposes[0],
    message: ""
  });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const advisorFor = (id) => advisors.find((a) => String(a.id) === String(id));

  // Determine current active advisor (fallback to first advisor if not chosen)
  const activeAdvisor = selectedAdvisor || advisors[0] || null;

  const filteredMeetings = useMemo(() => {
    return meetings
      .filter((m) => {
        const matchesStatus = filter === "All" || m.status === filter;
        const advisorName = advisorFor(m.advisorId)?.name || "";
        const matchesSearch =
          !search ||
          m.purpose.toLowerCase().includes(search.toLowerCase()) ||
          advisorName.toLowerCase().includes(search.toLowerCase()) ||
          m.date.includes(search);
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [meetings, filter, search, advisors]);

  const counts = useMemo(() => {
    return {
      all: meetings.length,
      requested: meetings.filter((m) => m.status === "REQUESTED").length,
      confirmed: meetings.filter((m) => m.status === "CONFIRMED").length,
      completed: meetings.filter((m) => m.status === "COMPLETED").length,
      cancelled: meetings.filter((m) => m.status === "CANCELLED").length
    };
  }, [meetings]);

  const request = async (e) => {
    e.preventDefault();

    if (!activeAdvisor) {
      setToast({
        message: "Please designate an advisor from the Advisor Directory before booking a consultation.",
        type: "warning"
      });
      return;
    }

    if (!form.date || !form.time) {
      setToast({
        message: "Please select both a consultation date and an appointment slot.",
        type: "error"
      });
      return;
    }

    if (form.date < today) {
      setToast({
        message: "Consultation date cannot be in the past. Please select today or a future date.",
        type: "error"
      });
      return;
    }

    // Check duplicate slot for this advisor
    const advisorConflict = meetings.some(
      (m) =>
        String(m.advisorId) === String(activeAdvisor.id) &&
        m.date === form.date &&
        m.time === form.time &&
        m.status !== "CANCELLED"
    );

    if (advisorConflict) {
      setToast({
        message: `${activeAdvisor.name} already has a consultation scheduled for this date and time. Please choose another slot.`,
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
        message: "You already have another appointment scheduled for this time slot. Please choose another time.",
        type: "error"
      });
      return;
    }

    setBusy(true);
    try {
      const now = new Date().toISOString();
      await createMeeting({
        ...form,
        advisorId: activeAdvisor.id,
        status: "REQUESTED",
        createdAt: now
      });

      await addActivity({
        title: "Consultation requested",
        description: `Consultation request placed with ${activeAdvisor.name} for ${form.date} at ${form.time}.`,
        date: now,
        type: "meeting"
      });

      setForm({
        date: "",
        time: "",
        purpose: meetingPurposes[0],
        message: ""
      });

      setToast({
        message: "Consultation request placed successfully.",
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
      const now = new Date().toISOString();
      await patchMeeting(m.id, {
        status,
        updatedAt: now
      });

      const advName = advisorFor(m.advisorId)?.name || "Advisor";

      await addActivity({
        title: `Meeting ${status.toLowerCase()}`,
        description: `Consultation with ${advName} on ${m.date} at ${m.time} marked as ${status}.`,
        date: now,
        type: "meeting"
      });

      setCancelModal(null);
      setDetail(null);
      setToast({
        message: `Consultation status updated to ${status}.`,
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
    if (!deleteModal) return;
    setBusy(true);
    try {
      const now = new Date().toISOString();
      await deleteMeeting(deleteModal.id);
      await addActivity({
        title: "Meeting record deleted",
        description: `The cancelled consultation record for ${deleteModal.date} at ${deleteModal.time} was permanently removed.`,
        date: now,
        type: "meeting"
      });

      setDeleteModal(null);
      setToast({
        message: "Cancelled consultation record permanently deleted.",
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

  // Only block render if genuinely loading with no records at all
  if (loading && !meetings.length && !advisors.length) {
    return <Loading label="Loading consultation records..." />;
  }

  return (
    <div className="meetings-page-container">
      {/* Page Header */}
      <div className="meetings-header-banner">
        <div className="meetings-header-left">
          <div className="crm-eyebrow-row">
            <span className="crm-brand-name">DJ Immigration Legal Counsel</span>
            <span className="crm-pill-badge">CONFIDENTIAL ONBOARDING CALENDAR</span>
          </div>
          <h1 className="meetings-page-title">Consultation & Strategy Meetings</h1>
          <p className="meetings-page-subtitle">
            Schedule, manage, and verify confidential investor briefings and portfolio legal reviews with licensed legal counsel.
          </p>
        </div>

        <div className="meetings-header-right">
          <div className="meetings-counter-chip">
            <CalendarCheck2 size={16} />
            <span>{counts.confirmed} Active Consultations</span>
          </div>
        </div>
      </div>

      {/* Top 4 Summary KPI Metric Cards */}
      <div className="meetings-top-stats-grid">
        <div className="meetings-top-stat-card">
          <span className="meetings-stat-label">TOTAL APPOINTMENTS</span>
          <div className="meetings-stat-value">{counts.all}</div>
          <span className="meetings-stat-note">All booked sessions</span>
        </div>

        <div className="meetings-top-stat-card">
          <span className="meetings-stat-label">CONFIRMED SESSIONS</span>
          <div className="meetings-stat-value" style={{ color: "#16a34a" }}>
            {counts.confirmed}
          </div>
          <span className="meetings-stat-note">Verified & ready for briefing</span>
        </div>

        <div className="meetings-top-stat-card">
          <span className="meetings-stat-label">PENDING COUNSEL REVIEW</span>
          <div className="meetings-stat-value" style={{ color: "#d97706" }}>
            {counts.requested}
          </div>
          <span className="meetings-stat-note">Awaiting attorney confirmation</span>
        </div>

        <div className="meetings-top-stat-card">
          <span className="meetings-stat-label">LEAD LEGAL COUNSEL</span>
          <div className="meetings-stat-value" style={{ fontSize: "20px", color: "#1e293b" }}>
            {activeAdvisor ? activeAdvisor.name : "Unassigned"}
          </div>
          <span className="meetings-stat-note">
            {activeAdvisor ? activeAdvisor.role : "Browse advisor network"}
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="meeting-layout">
        {/* Left Column: Book a Consultation Form */}
        <section className="panel meeting-form-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">NEW APPOINTMENT</span>
              <h3>Book a Consultation</h3>
            </div>
            <div className="form-icon-bubble">
              <CalendarPlus size={20} />
            </div>
          </div>

          {activeAdvisor ? (
            <div className="chosen-advisor-card">
              <AdvisorAvatar advisor={activeAdvisor} size="medium" showStatus={true} />
              <div className="chosen-advisor-info">
                <span className="lead-tag">DESIGNATED COUNSEL</span>
                <h4>{activeAdvisor.name}</h4>
                <p>{activeAdvisor.role} · {activeAdvisor.location || "Europe"}</p>
              </div>
              <Link to="/advisors" className="switch-adv-link" title="Change lead advisor">
                Switch
              </Link>
            </div>
          ) : (
            <div className="notice notice-gold no-advisor-notice">
              <AlertTriangle size={18} />
              <div>
                <b>No Legal Advisor Assigned</b>
                <p>
                  Please select an advisor from our directory to enable consultation booking.{" "}
                  <Link to="/advisors" className="notice-link">
                    Browse Advisors →
                  </Link>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={request} className="meeting-form">
            <div className="form-field">
              <label htmlFor="meeting-date" className="field-label">
                <span>Consultation Date</span>
                <span className="required-indicator">*</span>
              </label>
              <div className="input-adorned-wrapper">
                <div className="input-adornment">
                  <Calendar size={16} />
                </div>
                <input
                  id="meeting-date"
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="form-input adorned"
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">
                <span>Select Available Time Slot</span>
                <span className="required-indicator">*</span>
              </label>
              <div className="time-slots-grid">
                {availableSlots.map((slot) => {
                  const isSelected = form.time === slot;
                  const isConflict =
                    form.date &&
                    activeAdvisor &&
                    meetings.some(
                      (m) =>
                        String(m.advisorId) === String(activeAdvisor.id) &&
                        m.date === form.date &&
                        m.time === slot &&
                        m.status !== "CANCELLED"
                    );

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isConflict}
                      className={`time-slot-pill ${isSelected ? "selected" : ""} ${isConflict ? "booked" : ""}`}
                      onClick={() => setForm({ ...form, time: slot })}
                    >
                      <Clock3 size={13} />
                      <span>{slot}</span>
                      {isConflict && <span className="booked-dot" title="Slot Booked" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="meeting-purpose" className="field-label">
                <span>Consultation Purpose</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="meeting-purpose"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="form-select"
                >
                  {meetingPurposes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="meeting-message" className="field-label">
                <span>Agenda Notes</span>
                <span className="optional-tag">(Optional)</span>
              </label>
              <textarea
                id="meeting-message"
                rows="3"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Include questions or specific program documents you'd like to discuss..."
                className="form-textarea"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary full-btn"
              disabled={busy || !activeAdvisor}
            >
              <CalendarPlus size={16} />
              {busy ? "Scheduling Request..." : "Request Consultation"}
            </button>
            <small className="form-footnote">
              Confidential consultation bookings. Records are securely stored for compliance audit.
            </small>
          </form>
        </section>

        {/* Right Column: Meeting Records & Filter List */}
        <section className="panel meeting-list-panel">
          <div className="consultation-records-header">
            <div className="consultation-records-top-row">
              <div className="consultation-title-wrapper">
                <span className="eyebrow consultation-eyebrow">PORTFOLIO CALENDAR</span>
                <h3 className="consultation-main-title">Consultation Records</h3>
              </div>

              <div className="consultation-stats-pill">
                <span>{filteredMeetings.length} of {counts.all} {filteredMeetings.length === 1 ? 'Session' : 'Sessions'}</span>
              </div>
            </div>

            <div className="meetings-filter-tabs-wrapper">
              <div className="meetings-filter-tabs">
                {[
                  { key: "All", label: "All", count: counts.all },
                  { key: "REQUESTED", label: "Requested", count: counts.requested },
                  { key: "CONFIRMED", label: "Confirmed", count: counts.confirmed },
                  { key: "COMPLETED", label: "Completed", count: counts.completed },
                  { key: "CANCELLED", label: "Cancelled", count: counts.cancelled }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    type="button"
                    className={`tab-filter-btn ${filter === key ? "active" : ""}`}
                    onClick={() => setFilter(key)}
                  >
                    <span>{label}</span>
                    <span className="tab-count">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Search in Meetings */}
          <div className="meeting-search-wrap">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search appointments by purpose, advisor name, or date..."
              className="meeting-search-input"
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearch("")}
              >
                Clear
              </button>
            )}
          </div>

          {!filteredMeetings.length ? (
            <div className="empty-meetings-container">
              <EmptyState
                icon={CalendarDays}
                title="No Meetings Found"
                description={
                  filter !== "All" || search
                    ? "No appointments match your current filter or search criteria."
                    : "You have no consultation appointments scheduled yet. Use the booking form to request your first session."
                }
                action={
                  (filter !== "All" || search) && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => {
                        setFilter("All");
                        setSearch("");
                      }}
                    >
                      Reset Filters
                    </button>
                  )
                }
              />
            </div>
          ) : (
            <div className="meeting-list">
              {filteredMeetings.map((m) => {
                const adv = advisorFor(m.advisorId);
                const dateObj = new Date(m.date + "T00:00:00");

                return (
                  <article className="meeting-pro-card" key={m.id}>
                    {/* Top Row: Date Badge, Time & Status */}
                    <div className="m-card-top-bar">
                      <div className="m-card-date-time-group">
                        <div className="m-card-calendar-badge">
                          <span className="m-card-cal-month">
                            {dateObj.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="m-card-cal-day">{dateObj.getDate()}</span>
                          <span className="m-card-cal-year">
                            {dateObj.toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                        </div>
                        <div className="m-card-time-badge">
                          <Clock3 size={13} />
                          <span>{m.time}</span>
                        </div>
                      </div>

                      <div className="m-card-status-wrap">
                        <StatusBadge status={m.status} />
                      </div>
                    </div>

                    {/* Middle: Purpose Title & Advisor Strip */}
                    <div className="m-card-content">
                      <h4 className="m-card-purpose">{m.purpose}</h4>

                      <div className="m-card-advisor-strip">
                        <AdvisorAvatar advisor={adv} size="small" showStatus={true} />
                        <div className="m-card-advisor-info">
                          <span className="m-card-advisor-kicker">LEAD COUNSEL</span>
                          <div className="m-card-advisor-name-row">
                            <strong className="m-card-advisor-name">{adv?.name || "Advisor"}</strong>
                            <span className="m-card-advisor-role">({adv?.role || "Immigration Counsel"})</span>
                          </div>
                        </div>
                      </div>

                      {/* Agenda Note Quote Block */}
                      {m.message && (
                        <div className="m-card-note-box">
                          <p className="m-card-note-text">"{m.message}"</p>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Creation Note & Actions */}
                    <div className="m-card-footer">
                      <span className="m-card-audit-timestamp">
                        {dateObj.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>

                      <div className="m-card-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-small"
                          title="View consultation details"
                          onClick={() => setDetail(m)}
                        >
                          <Eye size={14} /> Details
                        </button>

                        {m.status === "REQUESTED" && (
                          <button
                            type="button"
                            className="btn btn-primary btn-small"
                            disabled={busy}
                            title="Simulate advisor confirming appointment"
                            onClick={() => updateStatus(m, "CONFIRMED")}
                          >
                            <CheckCircle2 size={14} /> Mock Confirm
                          </button>
                        )}

                        {m.status === "CONFIRMED" && (
                          <button
                            type="button"
                            className="btn btn-primary btn-small"
                            disabled={busy}
                            title="Mark meeting completed"
                            onClick={() => updateStatus(m, "COMPLETED")}
                          >
                            <Check size={14} /> Complete
                          </button>
                        )}

                        {m.status !== "CANCELLED" && m.status !== "COMPLETED" && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-small"
                            title="Cancel consultation"
                            onClick={() => setCancelModal(m)}
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        )}

                        {m.status === "CANCELLED" && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-small"
                            title="Delete cancelled demo record"
                            onClick={() => setDeleteModal(m)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Meeting Details Modal */}
      {detail && (
        <Modal
          title="Consultation Details"
          subtitle="Appointment Record & Lifecycle State"
          onClose={() => setDetail(null)}
          maxWidth="560px"
        >
          <div className="meeting-detail-content">
            <div className="detail-status-banner">
              <div>
                <span className="detail-sub-label">Current Status</span>
                <StatusBadge status={detail.status} />
              </div>
              <div className="detail-time-tag">
                <Clock3 size={15} />
                <span>{detail.time}</span>
              </div>
            </div>

            <div className="detail-advisor-box">
              <AdvisorAvatar advisor={advisorFor(detail.advisorId)} size="large" showStatus={true} />
              <div>
                <span className="p-label">Assigned Legal Counsel</span>
                <h4>{advisorFor(detail.advisorId)?.name || "Advisor"}</h4>
                <p>{advisorFor(detail.advisorId)?.role} · {advisorFor(detail.advisorId)?.location}</p>
              </div>
            </div>

            <div className="detail-rows-list">
              <div className="detail-row">
                <span className="detail-row-label">Scheduled Date</span>
                <b className="detail-row-val">
                  {new Date(detail.date + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </b>
              </div>

              <div className="detail-row">
                <span className="detail-row-label">Consultation Purpose</span>
                <b className="detail-row-val">{detail.purpose}</b>
              </div>

              <div className="detail-row">
                <span className="detail-row-label">Investor Notes</span>
                <p className="detail-row-val notes">
                  {detail.message || "No specific agenda notes submitted with this request."}
                </p>
              </div>

              <div className="detail-row">
                <span className="detail-row-label">Record Created</span>
                <span className="detail-row-val">
                  {new Date(detail.createdAt || new Date()).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDetail(null)}
              >
                Close Details
              </button>

              {detail.status === "REQUESTED" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() => updateStatus(detail, "CONFIRMED")}
                >
                  <CheckCircle2 size={15} /> Mock Confirm
                </button>
              )}

              {detail.status === "CONFIRMED" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() => updateStatus(detail, "COMPLETED")}
                >
                  <Check size={15} /> Mark as Completed
                </button>
              )}

              {detail.status !== "CANCELLED" && detail.status !== "COMPLETED" && (
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={busy}
                  onClick={() => {
                    setDetail(null);
                    setCancelModal(detail);
                  }}
                >
                  <XCircle size={15} /> Cancel Appointment
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Consultation Confirmation Modal */}
      {cancelModal && (
        <ConfirmModal
          title="Cancel Consultation Appointment"
          message={`Are you sure you wish to cancel the consultation scheduled with ${advisorFor(cancelModal.advisorId)?.name || "your advisor"} for ${cancelModal.date} at ${cancelModal.time}?`}
          confirmLabel="Cancel Appointment"
          confirmVariant="danger"
          onConfirm={() => updateStatus(cancelModal, "CANCELLED")}
          onClose={() => setCancelModal(null)}
          busy={busy}
        />
      )}

      {/* Delete Record Confirmation Modal */}
      {deleteModal && (
        <ConfirmModal
          title="Permanently Delete Demo Record"
          message={`Are you sure you wish to permanently remove the cancelled appointment record for ${deleteModal.date} at ${deleteModal.time}? This action cannot be undone.`}
          confirmLabel="Delete Record"
          confirmVariant="danger"
          onConfirm={removeMeeting}
          onClose={() => setDeleteModal(null)}
          busy={busy}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
