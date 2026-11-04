import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  CalendarDays,
  Activity,
  Menu,
  X,
  Bell,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  UserCheck,
  FileCheck2,
  CalendarCheck,
  ChevronDown
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Modal, AdvisorAvatar } from "./UI";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/questionnaire", label: "K&Q Questionnaire", icon: ClipboardList },
  { to: "/advisors", label: "Advisors", icon: Users },
  { to: "/meetings", label: "Meetings", icon: CalendarDays },
  { to: "/activity", label: "Activity", icon: Activity }
];

const titles = {
  "/": { title: "Overview", section: "Investor Dashboard" },
  "/questionnaire": { title: "K&Q Questionnaire", section: "Onboarding Stage" },
  "/advisors": { title: "Advisor Network", section: "Professional Counsel" },
  "/meetings": { title: "Meetings", section: "Consultation Schedule" },
  "/activity": { title: "Activity Timeline", section: "Audit Trail" }
};

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readNotifs, setReadNotifs] = useState(false);
  const location = useLocation();
  const { activities, currentSubmission, selectedAdvisor, meetings } = useApp();

  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeMeetings = meetings.filter((m) => ["REQUESTED", "CONFIRMED"].includes(m.status));
  const pageMeta = titles[location.pathname] || { title: "Investor Portal", section: "Workspace" };

  return (
    <div className="app-shell">
      {open && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <span>DJ</span>
          </div>
          <div className="brand-text">
            <strong>DJ IMMIGRATION</strong>
            <span>INVESTOR PORTAL</span>
          </div>
          <button
            type="button"
            className="icon-btn mobile-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-section-tag">PORTAL WORKSPACE</div>

        <nav className="sidebar-nav">
          {nav.map(({ to, label, icon: Icon, end }) => {
            let badge = null;
            if (to === "/meetings" && activeMeetings.length > 0) {
              badge = <span className="nav-badge">{activeMeetings.length}</span>;
            } else if (to === "/questionnaire" && currentSubmission?.status === "Clarification Required") {
              badge = <span className="nav-badge alert">!</span>;
            }

            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <div className="nav-link-icon-wrap">
                  <Icon size={19} />
                </div>
                <span className="nav-link-title">{label}</span>
                {badge}
                <ChevronRight className="nav-chevron" size={15} />
              </NavLink>
            );
          })}
        </nav>

        {/* Assigned Advisor Widget in Sidebar */}
        {selectedAdvisor && (
          <Link to="/advisors" className="sidebar-advisor-box" title="View assigned legal counsel">
            <span className="sidebar-advisor-kicker">ACTIVE LEAD COUNSEL</span>
            <div className="sidebar-advisor-content">
              <AdvisorAvatar advisor={selectedAdvisor} size="small" showStatus={true} />
              <div className="sidebar-advisor-info">
                <b>{selectedAdvisor.name}</b>
                <span>{selectedAdvisor.role}</span>
              </div>
            </div>
          </Link>
        )}

        <div className="sidebar-bottom">
          <div className="secure-badge-row">
            <div className="secure-icon">
              <ShieldCheck size={18} />
            </div>
            <div className="secure-text">
              <b>Private Client Workspace</b>
              <span>Mock institutional records only</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-btn menu-trigger"
              onClick={() => setOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>
            <nav className="crumb" aria-label="Breadcrumb">
              <span>{pageMeta.section}</span>
              <ChevronRight size={14} className="crumb-arrow" />
              <strong>{pageMeta.title}</strong>
            </nav>
          </div>

          <div className="topbar-right">
            <span className="demo-pill" title="This is a sandbox simulation environment">
              <span className="demo-dot" /> Demo Environment
            </span>

            {/* Notification Menu */}
            <div className="notif-wrapper" ref={notifRef}>
              <button
                type="button"
                className={`icon-btn notification-btn ${notifOpen ? "active" : ""}`}
                aria-label="View notifications"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={19} />
                {!readNotifs && activities.length > 0 && <span className="notification-dot" />}
              </button>

              {notifOpen && (
                <div className="notif-popover">
                  <div className="notif-popover-head">
                    <div>
                      <h4>Notifications & Events</h4>
                      <small>{activities.length} total audited events</small>
                    </div>
                    <button
                      type="button"
                      className="text-action-btn"
                      onClick={() => setReadNotifs(true)}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="notif-list">
                    {activities.slice(0, 5).map((item) => (
                      <div className="notif-item" key={item.id}>
                        <div className="notif-icon-circle">
                          <CheckCircle2 size={14} />
                        </div>
                        <div className="notif-details">
                          <b>{item.title}</b>
                          <p>{item.description}</p>
                          <time>
                            {new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </time>
                        </div>
                      </div>
                    ))}
                    {!activities.length && (
                      <div className="notif-empty">No new activity records.</div>
                    )}
                  </div>
                  <div className="notif-popover-foot">
                    <Link
                      to="/activity"
                      onClick={() => setNotifOpen(false)}
                      className="btn btn-secondary full-btn btn-small"
                    >
                      View all in Activity log <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Chip */}
            <button
              type="button"
              className="user-chip-btn"
              onClick={() => setProfileOpen(true)}
              aria-label="View investor profile"
            >
              <div className="user-avatar-frame">
                <img
                  src="/portraits/investor.jpg"
                  alt="Jordan Smith"
                  className="user-avatar-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = "grid";
                    }
                  }}
                />
                <div className="user-avatar fallback-user" style={{ display: "none" }}>
                  JS
                </div>
              </div>
              <div className="user-chip-text">
                <b>Jordan Smith</b>
                <span>Investor Account</span>
              </div>
              <ChevronDown size={14} className="user-chip-arrow" />
            </button>
          </div>
        </header>

        <div className="page-wrap">
          <Outlet />
        </div>

        <footer className="footer">
          <div className="footer-left">
            <span className="footer-brand">DJ IMMIGRATION</span>
            <span>· Institutional Investor Onboarding Portal Demo</span>
          </div>
          <div className="footer-right">
            <span>Client ID: INV-2026-8812</span>
            <span>·</span>
            <span>Training & Demonstration Environment</span>
          </div>
        </footer>
      </main>

      {/* User Profile Modal */}
      {profileOpen && (
        <Modal
          title="Investor Portfolio Profile"
          subtitle="Demo Account & Compliance Verification"
          onClose={() => setProfileOpen(false)}
          maxWidth="520px"
        >
          <div className="profile-overview-box">
            <div className="profile-card-top">
              <div className="profile-large-avatar-frame">
                <img
                  src="/portraits/investor.jpg"
                  alt="Jordan Smith"
                  className="profile-large-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = "grid";
                    }
                  }}
                />
                <div className="profile-large-avatar fallback-large" style={{ display: "none" }}>
                  JS
                </div>
              </div>
              <div>
                <h3>Jordan Smith</h3>
                <p>Principal Investor Account · Tier 1 High Net Worth</p>
                <span className="verified-badge">
                  <CheckCircle2 size={13} /> Identity Verified (Demo)
                </span>
              </div>
            </div>

            <div className="profile-details-grid">
              <div className="profile-stat-box">
                <span className="p-label">Investor ID</span>
                <b>INV-2026-8812</b>
              </div>
              <div className="profile-stat-box">
                <span className="p-label">Questionnaire</span>
                <b>
                  {currentSubmission?.status || "Draft"} ({currentSubmission?.progress || 0}%)
                </b>
              </div>
              <div className="profile-stat-box">
                <span className="p-label">Lead Legal Counsel</span>
                <b>{selectedAdvisor?.name || "Not assigned"}</b>
              </div>
              <div className="profile-stat-box">
                <span className="p-label">Consultations</span>
                <b>{meetings.length} Scheduled</b>
              </div>
            </div>

            {selectedAdvisor && (
              <div className="profile-advisor-summary">
                <span className="p-label">Assigned Counsel Details:</span>
                <div className="assigned-adv-row">
                  <AdvisorAvatar advisor={selectedAdvisor} size="medium" />
                  <div>
                    <b>{selectedAdvisor.name}</b>
                    <span>{selectedAdvisor.role} · {selectedAdvisor.location}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="profile-notice">
              <ShieldCheck size={18} />
              <p>
                This account operates within a secure mock container for evaluation purposes. All
                compliance flags and submissions are recorded locally.
              </p>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary full-btn"
              onClick={() => setProfileOpen(false)}
            >
              Close Profile
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
