import { useMemo, useState } from "react";
import {
  Search,
  BriefcaseBusiness,
  Clock3,
  CheckCircle2,
  UserRound,
  AlertTriangle,
  Check,
  Star,
  MapPin,
  Mail,
  Phone,
  Globe,
  CalendarPlus,
  ShieldCheck,
  X,
  UserCheck,
  FileText,
  Award,
  GraduationCap,
  Scale,
  Sparkles,
  Headphones,
  CheckCheck,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { saveSelection, addActivity, getErrorMessage } from "../api/client";
import { useApp } from "../context/AppContext";
import { PageTitle, Loading, ErrorState, Modal, ConfirmModal, Toast, AdvisorAvatar } from "../components/UI";

export default function Advisors() {
  const { advisors, meetings, selectedAdvisor, loading, apiError, refresh } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [profile, setProfile] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const allExpertise = useMemo(() => {
    return ["All", ...new Set(advisors.flatMap((a) => a.expertise || []))];
  }, [advisors]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return advisors.filter((a) => {
      const matchText =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (a.location && a.location.toLowerCase().includes(q)) ||
        (a.expertise || []).some((e) => e.toLowerCase().includes(q)) ||
        (a.languages || []).some((l) => l.toLowerCase().includes(q));

      const matchFilter = filter === "All" || (a.expertise || []).includes(filter);

      return matchText && matchFilter;
    });
  }, [advisors, search, filter]);

  const activeMeetingsWithCurrent = useMemo(() => {
    if (!selectedAdvisor) return [];
    return meetings.filter(
      (m) =>
        String(m.advisorId) === String(selectedAdvisor.id) &&
        ["REQUESTED", "CONFIRMED"].includes(m.status)
    );
  }, [meetings, selectedAdvisor]);

  const handleSelectClick = (advisor) => {
    if (String(selectedAdvisor?.id) === String(advisor.id)) return;
    setConfirm(advisor);
  };

  const executeSelection = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const record = {
        advisorId: confirm.id,
        selectedAt: now
      };
      await saveSelection(record);
      await addActivity({
        title: "Lead advisor appointed",
        description: `${confirm.name} (${confirm.role}) was appointed as your designated immigration and investment counsel.`,
        date: now,
        type: "advisor"
      });
      await refresh();
      setToast({
        message: `${confirm.name} has been appointed as your lead immigration counsel.`,
        type: "success"
      });
      setConfirm(null);
    } catch (e) {
      setToast({
        message: getErrorMessage(e) || "Something went wrong. Please try again.",
        type: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading label="Loading licensed advisor network" />;
  if (apiError) return <ErrorState message={apiError} onRetry={refresh} />;

  return (
    <>
      <PageTitle
        eyebrow="LICENSED LEGAL COUNSEL"
        title="Immigration Advisor Directory"
        description="Select a dedicated legal practitioner specializing in residency-by-investment, enterprise migration, and private client relocation."
        action={
          <span className="subtle-tag">
            {advisors.length} Certified Practitioners
          </span>
        }
      />

      {/* Currently Selected Advisor Hero Strip */}
      {selectedAdvisor && (
        <div className="active-advisor-banner">
          <div className="active-adv-portrait-wrap">
            <AdvisorAvatar advisor={selectedAdvisor} size="large" showStatus={true} />
          </div>
          <div className="active-adv-info">
            <div className="active-adv-header-badge">
              <span className="active-adv-label">CURRENTLY ASSIGNED LEAD COUNSEL</span>
              <span className="active-adv-verified">
                <CheckCircle2 size={13} /> Active Portfolio Representation
              </span>
            </div>
            <h3>{selectedAdvisor.name}</h3>
            <p>
              {selectedAdvisor.role} · {selectedAdvisor.location || "International Chambers"} · {selectedAdvisor.experience} Experience
            </p>
          </div>
          <div className="active-adv-actions">
            <Link to="/meetings" className="btn btn-gold btn-small">
              <CalendarPlus size={15} /> Book Consultation
            </Link>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => setProfile(selectedAdvisor)}
            >
              <UserRound size={14} /> View Full Profile
            </button>
          </div>
        </div>
      )}

      {/* Search and Category Filter Bar */}
      <div className="advisors-filter-container">
        <div className="advisors-search-box">
          <Search size={18} className="search-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by advisor name, specialty, role, language, or jurisdiction..."
            className="search-input"
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search query"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Quick Expertise Filter Chips */}
        <div className="expertise-filter-chips">
          {allExpertise.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`filter-chip ${filter === tag ? "active" : ""}`}
              onClick={() => setFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Redesigned Compact Advisor Cards Grid */}
      <div className="advisors-grid">
        {filtered.map((a) => {
          const isSelected = String(selectedAdvisor?.id) === String(a.id);
          return (
            <article
              className={`advisor-card compact-advisor-card ${isSelected ? "advisor-card-selected" : ""}`}
              key={a.id}
            >
              {isSelected && (
                <div className="advisor-selected-ribbon">
                  <Check size={12} /> Assigned Counsel
                </div>
              )}

              <div className="advisor-card-accent-bar" />

              {/* Top Compact Card Header */}
              <div className="compact-card-header">
                <AdvisorAvatar
                  advisor={a}
                  size="medium"
                  showStatus={true}
                  className="compact-card-avatar"
                />

                <div className="compact-card-identity">
                  <div className="compact-name-row">
                    <h4>{a.name}</h4>
                    <span className="verified-seal" title="Verified Immigration Counsel">
                      <ShieldCheck size={13} />
                    </span>
                  </div>
                  <span className="compact-advisor-role">{a.role}</span>
                </div>

                <div className="compact-rating-pill" title={`Client rating: ${a.rating} / 5.0`}>
                  <Star size={12} fill="#d4af37" color="#d4af37" />
                  <span>{a.rating || 4.9}</span>
                </div>
              </div>

              {/* Meta Badges Strip */}
              <div className="compact-highlights-row">
                <div className="highlight-pill" title="Years of experience">
                  <Clock3 size={13} />
                  <span>{a.experience}</span>
                </div>
                <div className="highlight-pill" title="Chambers location">
                  <MapPin size={13} />
                  <span>{a.location || "London, UK"}</span>
                </div>
                <div className="highlight-pill availability-pill" title="Current client availability">
                  <span className="availability-dot" />
                  <span>{a.availability || "Available Today"}</span>
                </div>
              </div>

              {/* Languages Information */}
              <div className="compact-languages-row">
                <Globe size={13} className="lang-icon" />
                <span className="lang-label">Languages:</span>
                <span className="lang-list">{(a.languages || ["English"]).join(", ")}</span>
              </div>

              {/* Practice Focus Tags */}
              <div className="compact-specialties-wrap">
                {(a.expertise || []).slice(0, 3).map((exp) => (
                  <span className="compact-spec-tag" key={exp}>
                    {exp}
                  </span>
                ))}
              </div>

              {/* Compact Action Buttons */}
              <div className="compact-card-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => setProfile(a)}
                  title={`View complete professional credentials for ${a.name}`}
                >
                  <UserRound size={14} /> View Profile
                </button>

                {isSelected ? (
                  <button type="button" className="btn btn-active-assigned btn-small" disabled>
                    <Check size={14} /> Assigned
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-small"
                    onClick={() => handleSelectClick(a)}
                    title={`Select ${a.name} as lead counsel`}
                  >
                    <UserCheck size={14} /> Select Advisor
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!filtered.length && (
        <div className="panel empty-search-panel">
          <EmptyState
            icon={UserRound}
            title="No Advisors Found"
            description="No legal practitioners match your current search query or filter selection."
            action={
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                }}
              >
                Reset Search Filters
              </button>
            }
          />
        </div>
      )}

      {/* Complete Professional Advisor Profile Modal */}
      {profile && (
        <Modal
          title="Professional Advisor Profile"
          subtitle={`Institutional Dossier · ${profile.name}`}
          onClose={() => setProfile(null)}
          maxWidth="700px"
        >
          <div className="dossier-modal-content">
            {/* Header Hero */}
            <div className="dossier-hero-card">
              <div className="dossier-avatar-wrap">
                <AdvisorAvatar
                  advisor={profile}
                  size="large"
                  showStatus={true}
                  className="dossier-avatar"
                />
              </div>

              <div className="dossier-hero-info">
                <div className="dossier-name-row">
                  <h3>{profile.name}</h3>
                  <span className="verified-seal-pill">
                    <ShieldCheck size={13} /> Verified Practitioner
                  </span>
                </div>

                <div className="dossier-role-title">{profile.role}</div>

                <div className="dossier-meta-chips">
                  <span className="dossier-chip">
                    <Star size={13} fill="#d4af37" color="#d4af37" /> {profile.rating || 4.9} Rating
                  </span>
                  <span className="dossier-chip">
                    <Clock3 size={13} /> {profile.experience} Experience
                  </span>
                  <span className="dossier-chip">
                    <MapPin size={13} /> {profile.location || "Chambers"}
                  </span>
                  <span className="dossier-chip availability-active">
                    <span className="availability-dot" /> {profile.availability || "Available Today"}
                  </span>
                </div>

                {profile.introduction && (
                  <p className="dossier-intro-snippet">{profile.introduction}</p>
                )}
              </div>
            </div>

            {/* Section: Biography */}
            <div className="dossier-section">
              <div className="dossier-section-title">
                <FileText size={16} />
                <h4>Professional Biography & Practice Overview</h4>
              </div>
              <p className="dossier-bio-text">{profile.bio}</p>
            </div>

            {/* Section: Core Expertise Pillars */}
            <div className="dossier-section">
              <div className="dossier-section-title">
                <BriefcaseBusiness size={16} />
                <h4>Immigration Consultancy Expertise</h4>
              </div>
              <div className="dossier-expertise-grid">
                {[
                  "Investor Immigration",
                  "Business Immigration",
                  "Permanent Residency",
                  "Investment Advisory",
                  "Immigration Documentation",
                  "Client Consultation"
                ].map((exp) => (
                  <div className="dossier-expertise-item" key={exp}>
                    <CheckCircle2 size={14} className="exp-icon" />
                    <span>{exp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Professional Credentials */}
            <div className="dossier-section">
              <div className="dossier-section-title">
                <GraduationCap size={16} />
                <h4>Educational Qualifications & Certifications</h4>
              </div>

              <div className="dossier-credentials-grid">
                {profile.qualifications && profile.qualifications.length > 0 && (
                  <div className="dossier-cred-box">
                    <div className="cred-box-label">Academic Degrees</div>
                    <ul className="dossier-list">
                      {profile.qualifications.map((q, idx) => (
                        <li key={idx}>
                          <CheckCheck size={14} className="list-check" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {profile.certifications && profile.certifications.length > 0 && (
                  <div className="dossier-cred-box">
                    <div className="cred-box-label">Professional Certifications</div>
                    <ul className="dossier-list">
                      {profile.certifications.map((c, idx) => (
                        <li key={idx}>
                          <Award size={14} className="list-check" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {profile.licenses && profile.licenses.length > 0 && (
                  <div className="dossier-cred-box">
                    <div className="cred-box-label">Bar & Regulatory Licenses</div>
                    <ul className="dossier-list">
                      {profile.licenses.map((l, idx) => (
                        <li key={idx}>
                          <Scale size={14} className="list-check" />
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {profile.achievements && profile.achievements.length > 0 && (
                  <div className="dossier-cred-box">
                    <div className="cred-box-label">Professional Achievements</div>
                    <ul className="dossier-list">
                      {profile.achievements.map((ach, idx) => (
                        <li key={idx}>
                          <Sparkles size={14} className="list-check" />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Consultation & Client Support */}
            <div className="dossier-section">
              <div className="dossier-section-title">
                <Headphones size={16} />
                <h4>Consultation & Client Support Details</h4>
              </div>

              <div className="dossier-details-boxes">
                {profile.consultationInfo && (
                  <div className="dossier-info-card">
                    <b>Consultation Scope:</b>
                    <p>{profile.consultationInfo}</p>
                  </div>
                )}
                {profile.clientSupport && (
                  <div className="dossier-info-card">
                    <b>Client Support Framework:</b>
                    <p>{profile.clientSupport}</p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="dossier-contact-row">
                <div className="dossier-contact-pill">
                  <Mail size={15} />
                  <span>{profile.email || "counsel@dj-immigration.com"}</span>
                </div>
                <div className="dossier-contact-pill">
                  <Phone size={15} />
                  <span>{profile.phone || "+44 20 7946 0192"}</span>
                </div>
                <div className="dossier-contact-pill">
                  <Globe size={15} />
                  <span>Languages: {(profile.languages || ["English"]).join(", ")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setProfile(null)}
            >
              Close Profile
            </button>

            {String(selectedAdvisor?.id) === String(profile.id) ? (
              <Link to="/meetings" className="btn btn-gold" onClick={() => setProfile(null)}>
                <CalendarPlus size={16} /> Schedule Consultation
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setProfile(null);
                  handleSelectClick(profile);
                }}
              >
                <UserCheck size={16} /> Select Advisor
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Centered Confirmation Modal */}
      {confirm && (
        <ConfirmModal
          title={selectedAdvisor ? "Confirm Advisor Reassignment" : "Confirm Advisor Appointment"}
          message={
            selectedAdvisor
              ? activeMeetingsWithCurrent.length > 0
                ? `You have ${activeMeetingsWithCurrent.length} active consultation(s) with ${selectedAdvisor.name}. Are you sure you wish to appoint ${confirm.name} (${confirm.role}) as your lead immigration counsel?`
                : `Are you sure you wish to appoint ${confirm.name} (${confirm.role}) as your designated lead counsel? Ongoing case diligence will be transferred to ${confirm.name}.`
              : `Appoint ${confirm.name} (${confirm.role}) as your lead immigration counsel?`
          }
          confirmLabel={selectedAdvisor ? "Confirm & Reassign" : "Confirm Appointment"}
          confirmVariant="primary"
          onConfirm={executeSelection}
          onClose={() => setConfirm(null)}
          busy={busy}
        />
      )}

      {/* Top-Positioned Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
