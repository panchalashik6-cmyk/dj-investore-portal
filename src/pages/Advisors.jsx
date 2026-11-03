import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  BriefcaseBusiness,
  Clock3,
  ArrowUpRight,
  CheckCircle2,
  UserRound,
  AlertTriangle,
  Check
} from "lucide-react";
import { saveSelection, addActivity, getErrorMessage } from "../api/client";
import { useApp } from "../context/AppContext";
import { PageTitle, Loading, ErrorState, Modal, Toast } from "../components/UI";

export default function Advisors() {
  const { advisors, meetings, selectedAdvisor, loading, apiError, refresh } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All expertise");
  const [profile, setProfile] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const expertise = ["All expertise", ...new Set(advisors.flatMap((a) => a.expertise || []))];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return advisors.filter((a) => {
      const matchText =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (a.expertise || []).some((e) => e.toLowerCase().includes(q));

      const matchFilter = filter === "All expertise" || (a.expertise || []).includes(filter);

      return matchText && matchFilter;
    });
  }, [advisors, search, filter]);

  const activeMeetings = useMemo(
    () => meetings.filter((m) => ["REQUESTED", "CONFIRMED"].includes(m.status)),
    [meetings]
  );

  const choose = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      const record = {
        advisorId: confirm.id,
        selectedAt: new Date().toISOString()
      };
      await saveSelection(record);
      await addActivity({
        title: "Advisor selected",
        description: `${confirm.name} was selected as your immigration advisor.`,
        date: new Date().toISOString(),
        type: "advisor"
      });
      await refresh();
      setToast({
        message: `${confirm.name} is now your selected advisor.`,
        type: "success"
      });
      setConfirm(null);
    } catch (e) {
      setToast({
        message: getErrorMessage(e),
        type: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading label="Loading advisor directory" />;
  if (apiError) return <ErrorState message={apiError} onRetry={refresh} />;

  return (
    <>
      <PageTitle
        eyebrow="EXPERT NETWORK"
        title="Find your advisor"
        description="Explore our demo advisor profiles and choose the expertise that best fits your goals."
        action={<span className="subtle-tag">{advisors.length} advisors available</span>}
      />

      {selectedAdvisor && (
        <div className="selected-strip">
          <div className="selected-check">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <b>Your selected advisor</b>
            <span>
              {selectedAdvisor.name} · {selectedAdvisor.role}
            </span>
          </div>
          <span className="selected-label">CURRENT SELECTION</span>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by advisor name, role, or expertise (e.g. Investor Visa)..."
          />
        </div>
        <div className="filter-select">
          <SlidersHorizontal size={16} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {expertise.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="advisor-grid">
        {filtered.map((a) => {
          const isSelected = String(selectedAdvisor?.id) === String(a.id);
          return (
            <article className={`advisor-card ${isSelected ? "advisor-card-selected" : ""}`} key={a.id}>
              <div className="advisor-card-top">
                <div className={`advisor-avatar avatar-${a.color || "gold"}`}>
                  {a.initials || a.name.split(" ").map((x) => x[0]).join("")}
                </div>
                <span className="verified-tag">
                  <CheckCircle2 size={13} /> DEMO PROFILE
                </span>
              </div>
              <h3>{a.name}</h3>
              <p className="advisor-role">{a.role}</p>
              <div className="advisor-meta">
                <span>
                  <Clock3 size={14} />
                  {a.experience}
                </span>
                <span>
                  <BriefcaseBusiness size={14} />
                  {a.expertise.length} specialties
                </span>
              </div>
              <p className="advisor-bio">{a.bio}</p>
              <div className="expertise-tags">
                {a.expertise.map((x) => (
                  <span key={x}>{x}</span>
                ))}
              </div>
              <div className="advisor-card-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setProfile(a)}
                >
                  View profile <ArrowUpRight size={15} />
                </button>
                {isSelected ? (
                  <button type="button" className="btn btn-secondary" disabled>
                    <Check size={14} /> Selected
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setConfirm(a)}
                  >
                    Select advisor
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!filtered.length && (
        <div className="panel">
          <div className="empty-state">
            <UserRound size={24} />
            <b>No advisors match your search</b>
            <p>Try searching for a different keyword or reset the expertise filter.</p>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />

      {profile && (
        <Modal
          title={profile.name}
          subtitle={profile.role}
          onClose={() => setProfile(null)}
        >
          <div className="profile-modal">
            <div className={`advisor-avatar large avatar-${profile.color || "gold"}`}>
              {profile.initials}
            </div>
            <div>
              <b>{profile.experience} of experience</b>
              <p>{profile.bio}</p>
            </div>
          </div>
          <h4 className="modal-section-title">Areas of expertise</h4>
          <div className="expertise-tags">
            {profile.expertise.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setProfile(null)}
            >
              Close
            </button>
            {String(selectedAdvisor?.id) === String(profile.id) ? (
              <button type="button" className="btn btn-secondary" disabled>
                <Check size={14} /> Currently Selected
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setProfile(null);
                  setConfirm(profile);
                }}
              >
                Select advisor
              </button>
            )}
          </div>
        </Modal>
      )}

      {confirm && (
        <Modal
          title="Confirm advisor selection"
          subtitle="Your primary advisor selection will be updated for this demo workspace."
          onClose={() => setConfirm(null)}
        >
          <div className="confirm-content">
            <div className="confirm-icon">
              <AlertTriangle size={21} />
            </div>
            <div style={{ flex: 1 }}>
              <p>
                Would you like to select <b>{confirm.name}</b> as your primary immigration
                advisor?
              </p>

              {selectedAdvisor && String(selectedAdvisor.id) !== String(confirm.id) && (
                <p className="modal-copy" style={{ marginTop: 8 }}>
                  You are changing your advisor from <b>{selectedAdvisor.name}</b> to{" "}
                  <b>{confirm.name}</b>.
                </p>
              )}

              {activeMeetings.length > 0 && selectedAdvisor && (
                <div className="notice notice-gold" style={{ marginTop: 12 }}>
                  <AlertTriangle size={18} />
                  <div>
                    <b>Active meeting notice:</b>
                    <p>
                      You currently have {activeMeetings.length} scheduled or requested meeting(s).
                      Changing your advisor will not cancel or reassign your existing meetings.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirm(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={choose}
            >
              {busy ? "Saving..." : "Confirm selection"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
