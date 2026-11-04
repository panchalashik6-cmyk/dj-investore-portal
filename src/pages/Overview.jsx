import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  Briefcase,
  CalendarDays,
  Hourglass,
  BarChart3,
  CheckSquare,
  Clock,
  Rocket,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Globe,
  Coins,
  ClipboardList
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Modal, Toast } from "../components/UI";

// Institutional investor onboarding cases
const initialInvestorCases = [
  {
    id: "INV-101",
    name: "Ashik Panchal",
    pathway: "Business Expansion",
    jurisdiction: "United Kingdom",
    capital: "$500,000",
    status: "New Inquiry",
    date: "03 Nov, 18:56",
    phone: "+44 20 7946 0912",
    advisor: "Michael Anderson"
  },
  {
    id: "INV-102",
    name: "Liam Vance",
    pathway: "Sovereign Fund Allocation",
    jurisdiction: "Portugal",
    capital: "$750,000",
    status: "Assigned",
    advisor: "Michael Anderson (Bar #UK-89210)",
    date: "03 Nov, 16:06",
    phone: "+351 21 123 4567"
  },
  {
    id: "INV-103",
    name: "Jason Bourne",
    pathway: "Real Estate Investment",
    jurisdiction: "United Arab Emirates",
    capital: "$1,200,000",
    status: "Assigned",
    advisor: "Sarah Williams (DIFC Reg #9842)",
    date: "03 Nov, 16:06",
    phone: "+971 4 312 8900"
  },
  {
    id: "INV-104",
    name: "Sarah Connor",
    pathway: "Permanent Residency Tier 1",
    jurisdiction: "Canada",
    capital: "$1,000,000",
    status: "Assigned",
    advisor: "David Miller (RCIC #R512903)",
    date: "02 Nov, 14:20",
    phone: "+1 416 555 0192"
  },
  {
    id: "INV-105",
    name: "Michael Scott",
    pathway: "Commercial Enterprise",
    jurisdiction: "United States (EB-5)",
    capital: "$800,000",
    status: "K&Q Review Sent",
    date: "02 Nov, 11:15",
    phone: "+1 212 555 0148"
  },
  {
    id: "INV-106",
    name: "Emma Watson",
    pathway: "Sovereign Fund Allocation",
    jurisdiction: "Switzerland",
    capital: "$2,000,000",
    status: "Contacted",
    date: "01 Nov, 17:30",
    phone: "+41 22 555 0199"
  },
  {
    id: "INV-107",
    name: "Jordan Smith",
    pathway: "Private Wealth Migration",
    jurisdiction: "United Kingdom",
    capital: "$1,500,000",
    status: "Consultation Booked",
    date: "01 Nov, 09:45",
    phone: "+44 20 7123 4567"
  },
  {
    id: "INV-108",
    name: "Elena Rostova",
    pathway: "Golden Visa Real Estate",
    jurisdiction: "Greece",
    capital: "$500,000",
    status: "Clarification Needed",
    date: "31 Oct, 15:10",
    phone: "+30 21 0123 4567"
  },
  {
    id: "INV-109",
    name: "David Miller",
    pathway: "Innovation Startup Visa",
    jurisdiction: "Canada",
    capital: "$600,000",
    status: "Under Due Diligence",
    date: "30 Oct, 13:00",
    phone: "+1 604 555 0183"
  },
  {
    id: "INV-110",
    name: "Chloe Bennett",
    pathway: "Family Relocation & Trust",
    jurisdiction: "Switzerland",
    capital: "$3,000,000",
    status: "Pathway Finalized",
    date: "29 Oct, 10:20",
    phone: "+41 44 555 0134"
  },
  {
    id: "INV-111",
    name: "Ashik Kumar",
    pathway: "High-Net-Worth Residency",
    jurisdiction: "United Kingdom",
    capital: "$1,000,000",
    status: "New Inquiry",
    date: "03 Nov, 16:39",
    phone: "+91 98250 12345"
  }
];

const investorLifecycleStatuses = [
  { key: "New Inquiry", color: "#c85a38", count: 2, pct: "18%" },
  { key: "Assigned to Counsel", color: "#16a34a", count: 3, pct: "27%" },
  { key: "K&Q Review Sent", color: "#d97706", count: 1, pct: "9%" },
  { key: "Contacted", color: "#0d9488", count: 1, pct: "9%" },
  { key: "Consultation Booked", color: "#15803d", count: 1, pct: "9%" },
  { key: "Clarification Needed", color: "#a16207", count: 1, pct: "9%" },
  { key: "Under Due Diligence", color: "#64748b", count: 1, pct: "9%" },
  { key: "Pathway Finalized", color: "#991b1b", count: 1, pct: "9%" }
];

export default function Overview() {
  const navigate = useNavigate();
  const { activities, advisors, currentSubmission } = useApp();
  const [investors, setInvestors] = useState(initialInvestorCases);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInvestorsListOpen, setIsInvestorsListOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  // Form for creating new investor case
  const [form, setForm] = useState({
    name: "",
    pathway: "Business Expansion",
    jurisdiction: "United Kingdom",
    capital: "$500,000 - $1,000,000",
    phone: "",
    email: "",
    status: "New Inquiry"
  });

  const handleCreateCase = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setToast({ message: "Please enter the investor's legal full name.", type: "error" });
      return;
    }

    const nowStr =
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short"
      }) +
      ", " +
      new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
      });

    const newCase = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      name: form.name.trim(),
      pathway: form.pathway,
      jurisdiction: form.jurisdiction,
      capital: form.capital,
      phone: form.phone.trim() || "+44 20 7000 0000",
      status: form.status,
      date: nowStr
    };

    setInvestors([newCase, ...investors]);
    setIsCreateOpen(false);
    setForm({
      name: "",
      pathway: "Business Expansion",
      jurisdiction: "United Kingdom",
      capital: "$500,000 - $1,000,000",
      phone: "",
      email: "",
      status: "New Inquiry"
    });

    setToast({
      message: `Investor onboarding profile created for ${newCase.name} (${newCase.jurisdiction} • ${newCase.pathway}).`,
      type: "success"
    });
  };

  const filteredInvestors = useMemo(() => {
    return investors.filter((inv) => {
      const matchStatus =
        filterStatus === "All" ||
        inv.status.toLowerCase().includes(filterStatus.toLowerCase());
      const matchSearch =
        !searchQuery ||
        inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.pathway.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [investors, filterStatus, searchQuery]);

  const openFilter = (status) => {
    setFilterStatus(status);
    setIsInvestorsListOpen(true);
  };

  return (
    <div className="crm-dashboard-container">
      {/* Header Banner */}
      <div className="crm-header-row">
        <div className="crm-header-left">
          <div className="crm-eyebrow-row">
            <span className="crm-brand-name">DJ Immigration Executive</span>
            <span className="crm-pill-badge">INVESTOR ONBOARDING PORTAL</span>
          </div>
          <h1 className="crm-dashboard-title">Investor Onboarding Dashboard</h1>
          <p className="crm-dashboard-subtitle">
            Live operational intelligence: monitor investor inquiries, legal counsel rosters, investment pathway splits, and recent compliance audit activity.
          </p>
        </div>

        <div className="crm-header-actions">
          <button
            type="button"
            className="crm-btn-outline"
            onClick={() => setIsInvestorsListOpen(true)}
          >
            <span>View All Investor Cases</span>
            <ArrowRight size={15} />
          </button>
          <button
            type="button"
            className="crm-btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} />
            <span>Create New Inquiry</span>
          </button>
        </div>
      </div>

      {/* 5 Top KPI Metric Cards (With Colored Top Accent Bars) */}
      <div className="crm-kpi-grid">
        {/* Card 1: Total Investor Inquiries */}
        <div className="crm-kpi-card">
          <div className="crm-kpi-bar crm-bar-terracotta" />
          <div className="crm-kpi-head">
            <div className="crm-kpi-icon-box">
              <Users size={18} />
            </div>
            <span className="crm-badge crm-badge-terracotta">PORTAL TOTAL</span>
          </div>
          <div className="crm-kpi-value">{investors.length}</div>
          <div className="crm-kpi-title">Total Inquiries</div>
          <div className="crm-kpi-footer">
            <span className="crm-kpi-subtext">All inquiries registered</span>
            <button
              type="button"
              className="crm-kpi-link crm-link-terracotta"
              onClick={() => openFilter("All")}
            >
              <span>View records</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 2: New Inquiries */}
        <div className="crm-kpi-card">
          <div className="crm-kpi-bar crm-bar-amber" />
          <div className="crm-kpi-head">
            <div className="crm-kpi-icon-box">
              <FileText size={18} />
            </div>
            <span className="crm-badge crm-badge-amber">AWAITING CALL</span>
          </div>
          <div className="crm-kpi-value">
            {investors.filter((l) => l.status === "New Inquiry").length}
          </div>
          <div className="crm-kpi-title">New Inquiries</div>
          <div className="crm-kpi-footer">
            <span className="crm-kpi-subtext">Requires contact</span>
            <button
              type="button"
              className="crm-kpi-link crm-link-amber"
              onClick={() => openFilter("New")}
            >
              <span>View records</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 3: Assigned to Counsel */}
        <div className="crm-kpi-card">
          <div className="crm-kpi-bar crm-bar-green" />
          <div className="crm-kpi-head">
            <div className="crm-kpi-icon-box">
              <Briefcase size={18} />
            </div>
            <span className="crm-badge crm-badge-green">ACTIVE COHORT</span>
          </div>
          <div className="crm-kpi-value">
            {investors.filter((l) => l.status === "Assigned" || l.status === "Assigned to Counsel").length}
          </div>
          <div className="crm-kpi-title">Assigned Cases</div>
          <div className="crm-kpi-footer">
            <span className="crm-kpi-subtext">Paired with legal advisor</span>
            <button
              type="button"
              className="crm-kpi-link crm-link-green"
              onClick={() => openFilter("Assigned")}
            >
              <span>View records</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 4: Booked Consultations */}
        <div className="crm-kpi-card">
          <div className="crm-kpi-bar crm-bar-orange" />
          <div className="crm-kpi-head">
            <div className="crm-kpi-icon-box">
              <CalendarDays size={18} />
            </div>
            <span className="crm-badge crm-badge-orange">SCHEDULED</span>
          </div>
          <div className="crm-kpi-value">
            {investors.filter((l) => l.status.includes("Booked")).length}
          </div>
          <div className="crm-kpi-title">Booked Consultations</div>
          <div className="crm-kpi-footer">
            <span className="crm-kpi-subtext">Scheduled & verified</span>
            <button
              type="button"
              className="crm-kpi-link crm-link-orange"
              onClick={() => openFilter("Booked")}
            >
              <span>View records</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 5: Unassigned Pool */}
        <div className="crm-kpi-card">
          <div className="crm-kpi-bar crm-bar-red" />
          <div className="crm-kpi-head">
            <div className="crm-kpi-icon-box">
              <Hourglass size={18} />
            </div>
            <span className="crm-badge crm-badge-red">ACTION NEEDED</span>
          </div>
          <div className="crm-kpi-value">
            {investors.filter((l) => !l.status.includes("Assigned") && !l.status.includes("Booked")).length}
          </div>
          <div className="crm-kpi-title">Unassigned Pool</div>
          <div className="crm-kpi-footer">
            <span className="crm-kpi-subtext">Pending matching</span>
            <button
              type="button"
              className="crm-kpi-link crm-link-red"
              onClick={() => openFilter("New")}
            >
              <span>View records</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Section */}
      <div className="crm-main-grid">
        {/* Left Column (Distribution + Summary Stats) */}
        <div className="crm-column-left">
          {/* Card: Investor Status Distribution */}
          <div className="crm-card">
            <div className="crm-card-head">
              <div className="crm-card-title-group">
                <BarChart3 size={18} className="crm-card-icon" />
                <h3 className="crm-card-title">Investor Status Distribution</h3>
              </div>
              <span className="crm-counter-tag">{investors.length} total investor records</span>
            </div>

            {/* Segmented Multi-Color Progress Bar */}
            <div className="crm-segmented-bar" title="Proportional Investor Distribution">
              <div className="crm-bar-slice" style={{ width: "18%", background: "#c85a38" }} title="New Inquiry: 18%" />
              <div className="crm-bar-slice" style={{ width: "27%", background: "#16a34a" }} title="Assigned to Counsel: 27%" />
              <div className="crm-bar-slice" style={{ width: "9%", background: "#d97706" }} title="K&Q Review Sent: 9%" />
              <div className="crm-bar-slice" style={{ width: "9%", background: "#0d9488" }} title="Contacted: 9%" />
              <div className="crm-bar-slice" style={{ width: "9%", background: "#15803d" }} title="Consultation Booked: 9%" />
              <div className="crm-bar-slice" style={{ width: "9%", background: "#a16207" }} title="Clarification Needed: 9%" />
              <div className="crm-bar-slice" style={{ width: "9%", background: "#64748b" }} title="Under Due Diligence: 9%" />
              <div className="crm-bar-slice" style={{ width: "9%", background: "#991b1b" }} title="Pathway Finalized: 9%" />
            </div>

            {/* Lifecycle Table */}
            <div className="crm-table-wrap">
              <table className="crm-status-table">
                <thead>
                  <tr>
                    <th>STATUS LIFECYCLE</th>
                    <th>SHARE</th>
                    <th style={{ textAlign: "right" }}>COUNT</th>
                    <th style={{ textAlign: "right" }}>PERCENTAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {investorLifecycleStatuses.map((item) => (
                    <tr key={item.key} onClick={() => openFilter(item.key)} className="crm-clickable-row">
                      <td>
                        <div className="crm-status-name-cell">
                          <span className="crm-status-dot" style={{ background: item.color }} />
                          <span className="crm-status-label">{item.key}</span>
                        </div>
                      </td>
                      <td>
                        <div className="crm-share-bar-track">
                          <div
                            className="crm-share-bar-fill"
                            style={{
                              width: item.pct,
                              background: item.color
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#1e293b" }}>
                        {item.count}
                      </td>
                      <td style={{ textAlign: "right", color: "#64748b", fontWeight: 600 }}>
                        {item.pct}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Operational Summary Statistics */}
          <div className="crm-card">
            <div className="crm-card-head">
              <div className="crm-card-title-group">
                <CheckSquare size={18} className="crm-card-icon" />
                <h3 className="crm-card-title">Investor Operational Summary Statistics</h3>
              </div>
              <span className="crm-counter-tag">Aggregated via JavaScript reduce()</span>
            </div>

            <div className="crm-ops-grid">
              <div className="crm-ops-box">
                <span className="crm-ops-label">PATHWAY ALLOCATION</span>
                <div className="crm-ops-val">4 Direct / 7 Fund</div>
                <span className="crm-ops-sub">Direct Enterprise (4) vs Sovereign Fund (7)</span>
              </div>

              <div className="crm-ops-box">
                <span className="crm-ops-label">ONBOARDING CONVERSION</span>
                <div className="crm-ops-val">27.3%</div>
                <span className="crm-ops-sub">3 retained of 11 total investor leads</span>
              </div>

              <div className="crm-ops-box">
                <span className="crm-ops-label">ADVISOR COUNSEL LOAD</span>
                <div className="crm-ops-val">35 / 64</div>
                <span className="crm-ops-sub">4 active licensed legal practitioners</span>
              </div>

              <div className="crm-ops-box" style={{ gridColumn: "span 3" }}>
                <span className="crm-ops-label">TOP CITIZENSHIP PROGRAM</span>
                <div className="crm-ops-val" style={{ fontSize: "20px" }}>Golden Visa (Tier 1)</div>
                <span className="crm-ops-sub">Portugal: 5 • Greece / UAE: 4 • United Kingdom: 2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Activity + Shortcuts) */}
        <div className="crm-column-right">
          {/* Card: Recent System Activity */}
          <div className="crm-card">
            <div className="crm-card-head">
              <div className="crm-card-title-group">
                <Clock size={18} className="crm-card-icon" />
                <h3 className="crm-card-title">Recent System Activity</h3>
              </div>
              <Link to="/activity" className="crm-sm-pill-btn">
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="crm-activity-feed">
              {/* Item 1 */}
              <article className="crm-activity-item">
                <div className="crm-activity-badge crm-act-blue">New!</div>
                <div className="crm-activity-content">
                  <div className="crm-activity-header">
                    <strong className="crm-act-title">Investor profile created</strong>
                    <time className="crm-act-time">03 Nov, 18:56</time>
                  </div>
                  <p className="crm-act-body">
                    New high-net-worth investor onboarding profile registered (Tier 1 • Business Expansion • United Kingdom).
                  </p>
                  <span className="crm-act-learner">Investor: Ashik Panchal</span>
                </div>
              </article>

              {/* Item 2 */}
              <article className="crm-activity-item">
                <div className="crm-activity-badge crm-act-blue">New!</div>
                <div className="crm-activity-content">
                  <div className="crm-activity-header">
                    <strong className="crm-act-title">K&Q Questionnaire submitted</strong>
                    <time className="crm-act-time">03 Nov, 16:39</time>
                  </div>
                  <p className="crm-act-body">
                    Investor completed Know-Your-Customer source of funds declaration for immigration audit.
                  </p>
                  <span className="crm-act-learner">Investor: Ashik Kumar</span>
                </div>
              </article>

              {/* Item 3 */}
              <article className="crm-activity-item">
                <div className="crm-activity-badge crm-act-green">✓</div>
                <div className="crm-activity-content">
                  <div className="crm-activity-header">
                    <strong className="crm-act-title">Legal counsel assigned after review</strong>
                    <time className="crm-act-time">03 Nov, 16:06</time>
                  </div>
                  <p className="crm-act-body">
                    Compliance team approved case representation. Assigned Senior Advisor Michael Anderson (Bar #UK-89210) to investor Liam Vance.
                  </p>
                  <span className="crm-act-learner">Investor: Liam Vance</span>
                </div>
              </article>

              {/* Item 4 */}
              <article className="crm-activity-item">
                <div className="crm-activity-badge crm-act-green">✓</div>
                <div className="crm-activity-content">
                  <div className="crm-activity-header">
                    <strong className="crm-act-title">Consultation confirmed with counsel</strong>
                    <time className="crm-act-time">03 Nov, 16:06</time>
                  </div>
                  <p className="crm-act-body">
                    Briefing on cross-border asset documentation confirmed with Investment Migration Consultant Sarah Williams.
                  </p>
                  <span className="crm-act-learner">Investor: Jason Bourne</span>
                </div>
              </article>

              {/* Item 5 */}
              <article className="crm-activity-item">
                <div className="crm-activity-badge crm-act-amber">⚙</div>
                <div className="crm-activity-content">
                  <div className="crm-activity-header">
                    <strong className="crm-act-title">Pathway recommendation generated</strong>
                    <time className="crm-act-time">03 Nov, 16:06</time>
                  </div>
                  <p className="crm-act-body">
                    Algorithmic asset evaluation identified David Miller (93% Match). Saved to review queue as Pending Approval.
                  </p>
                  <span className="crm-act-learner">Investor: Jason Bourne</span>
                </div>
              </article>
            </div>
          </div>

          {/* Card: Operational Shortcuts */}
          <div className="crm-card">
            <div className="crm-card-head">
              <div className="crm-card-title-group">
                <Rocket size={18} className="crm-card-icon" />
                <h3 className="crm-card-title">Operational Shortcuts</h3>
              </div>
            </div>

            <div className="crm-shortcuts-grid">
              <Link to="/questionnaire" className="crm-shortcut-item">
                <div className="crm-shortcut-left">
                  <ClipboardList size={16} />
                  <span>K&Q Questionnaire</span>
                </div>
                <ArrowRight size={14} className="crm-shortcut-arrow" />
              </Link>

              <Link to="/advisors" className="crm-shortcut-item">
                <div className="crm-shortcut-left">
                  <Users size={16} />
                  <span>Advisor Counsel</span>
                </div>
                <ArrowRight size={14} className="crm-shortcut-arrow" />
              </Link>

              <Link to="/meetings" className="crm-shortcut-item">
                <div className="crm-shortcut-left">
                  <CalendarDays size={16} />
                  <span>Consultations Calendar</span>
                </div>
                <ArrowRight size={14} className="crm-shortcut-arrow" />
              </Link>

              <Link to="/activity" className="crm-shortcut-item">
                <div className="crm-shortcut-left">
                  <Clock size={16} />
                  <span>Audit Timeline</span>
                </div>
                <ArrowRight size={14} className="crm-shortcut-arrow" />
              </Link>

              <button
                type="button"
                onClick={() => setIsReportsOpen(true)}
                className="crm-shortcut-item crm-shortcut-full"
              >
                <div className="crm-shortcut-left">
                  <BarChart3 size={16} />
                  <span>Portfolio Reports & Analytics</span>
                </div>
                <ArrowRight size={14} className="crm-shortcut-arrow" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create New Investor Inquiry */}
      {isCreateOpen && (
        <Modal
          title="Create New Investor Inquiry"
          subtitle="Register an incoming high-net-worth investor case into the portal workspace"
          onClose={() => setIsCreateOpen(false)}
          maxWidth="560px"
        >
          <form onSubmit={handleCreateCase} className="crm-modal-form">
            <div className="form-field">
              <label className="field-label">
                <span>Investor Legal Full Name</span>
                <span className="required-indicator">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ashik Panchal"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label className="field-label">
                  <span>Investment Pathway</span>
                </label>
                <select
                  className="form-select"
                  value={form.pathway}
                  onChange={(e) => setForm({ ...form, pathway: e.target.value })}
                >
                  <option value="Business Expansion">Business Expansion</option>
                  <option value="Sovereign Fund Allocation">Sovereign Fund Allocation</option>
                  <option value="Real Estate Investment">Real Estate Investment</option>
                  <option value="Permanent Residency Tier 1">Permanent Residency Tier 1</option>
                  <option value="Innovation Startup Visa">Innovation Startup Visa</option>
                </select>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <span>Target Jurisdiction</span>
                </label>
                <select
                  className="form-select"
                  value={form.jurisdiction}
                  onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Portugal">Portugal (Golden Visa)</option>
                  <option value="United Arab Emirates">United Arab Emirates (Golden Visa)</option>
                  <option value="Canada">Canada (Start-Up / SUV)</option>
                  <option value="United States">United States (EB-5)</option>
                  <option value="Switzerland">Switzerland (Lump-sum Residency)</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label className="field-label">
                  <span>Estimated Capital Range</span>
                </label>
                <select
                  className="form-select"
                  value={form.capital}
                  onChange={(e) => setForm({ ...form, capital: e.target.value })}
                >
                  <option value="$500,000 - $1,000,000">$500,000 - $1,000,000</option>
                  <option value="$1,000,000 - $2,500,000">$1,000,000 - $2,500,000</option>
                  <option value="$2,500,000 - $5,000,000">$2,500,000 - $5,000,000</option>
                  <option value="$5,000,000+">$5,000,000+ (Ultra High-Net-Worth)</option>
                </select>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <span>Contact Phone</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+44 20 7946 0912"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">
                <span>Initial Onboarding State</span>
              </label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="New Inquiry">New Inquiry (Awaiting Review)</option>
                <option value="Contacted">Contacted by Case Officer</option>
                <option value="K&Q Review Sent">K&Q Review Sent</option>
                <option value="Assigned">Assigned to Lead Counsel</option>
              </select>
            </div>

            <div className="modal-actions" style={{ marginTop: "24px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ background: "#c85a38", borderColor: "#c85a38" }}>
                <Plus size={16} /> Register Investor Case
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View All Investor Cases */}
      {isInvestorsListOpen && (
        <Modal
          title="Investor Onboarding Directory"
          subtitle={`Viewing ${filteredInvestors.length} of ${investors.length} confidential investor cases`}
          onClose={() => setIsInvestorsListOpen(false)}
          maxWidth="780px"
        >
          <div className="crm-leads-modal-content">
            <div className="crm-modal-filter-row">
              <div className="crm-modal-search">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search by investor name, jurisdiction, or pathway..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} className="search-clear-btn">
                    Clear
                  </button>
                )}
              </div>

              <div className="crm-modal-filter-tabs">
                {["All", "New", "Assigned", "Booked"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`crm-modal-tab ${filterStatus === s ? "active" : ""}`}
                    onClick={() => setFilterStatus(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="crm-modal-leads-list">
              {filteredInvestors.map((inv) => (
                <div className="crm-modal-lead-item" key={inv.id}>
                  <div className="crm-modal-lead-left">
                    <div className="crm-modal-avatar">
                      {inv.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="crm-modal-lead-name">{inv.name}</h4>
                      <div className="crm-modal-lead-meta">
                        <span>{inv.pathway}</span>
                        <span>•</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                          <Globe size={12} /> {inv.jurisdiction}
                        </span>
                        <span>•</span>
                        <b style={{ color: "#b45309" }}>{inv.capital}</b>
                      </div>
                      {inv.advisor && (
                        <div className="crm-modal-lead-instructor">
                          Assigned Counsel: <b>{inv.advisor}</b>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="crm-modal-lead-right">
                    <span
                      className="crm-status-pill"
                      style={{
                        background:
                          inv.status.includes("Assigned")
                            ? "#dcfce7"
                            : inv.status.includes("New")
                            ? "#fef3c7"
                            : inv.status.includes("Booked")
                            ? "#f0fdf4"
                            : "#f1f5f9",
                        color:
                          inv.status.includes("Assigned")
                            ? "#15803d"
                            : inv.status.includes("New")
                            ? "#b45309"
                            : inv.status.includes("Booked")
                            ? "#166534"
                            : "#475569"
                      }}
                    >
                      {inv.status}
                    </span>
                    <time className="crm-modal-lead-time">{inv.date}</time>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions" style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsInvestorsListOpen(false)}
              >
                Close Directory
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: "#c85a38", borderColor: "#c85a38" }}
                onClick={() => {
                  setIsInvestorsListOpen(false);
                  setIsCreateOpen(true);
                }}
              >
                <Plus size={16} /> New Case
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Reports & Analytics */}
      {isReportsOpen && (
        <Modal
          title="Investor Portfolio Analytics & Performance"
          subtitle="Aggregated capital allocations, onboarding velocity, and counsel workload statistics"
          onClose={() => setIsReportsOpen(false)}
          maxWidth="640px"
        >
          <div className="crm-reports-modal-content">
            <div className="crm-reports-stat-row">
              <div className="crm-reports-card">
                <span className="p-label">Active Portfolios</span>
                <h3>{investors.length}</h3>
                <small className="p-up">↑ 18% vs last quarter</small>
              </div>
              <div className="crm-reports-card">
                <span className="p-label">Legal Counsels</span>
                <h3>4</h3>
                <small>88% capacity utilization</small>
              </div>
              <div className="crm-reports-card">
                <span className="p-label">Onboarding Velocity</span>
                <h3>27.3%</h3>
                <small className="p-up">↑ 4.2% faster compliance</small>
              </div>
            </div>

            <div className="crm-reports-section">
              <h4>Capital Allocation Split</h4>
              <div className="crm-reports-bar-wrap">
                <div style={{ width: "63.6%", background: "#16a34a" }} title="Sovereign Fund (63.6%)">
                  7 Sovereign Fund
                </div>
                <div style={{ width: "36.4%", background: "#d97706" }} title="Direct Investment (36.4%)">
                  4 Direct Enterprise
                </div>
              </div>
            </div>

            <div className="crm-reports-section">
              <h4>Top Performing Target Jurisdictions</h4>
              <ul className="crm-territory-list">
                <li>
                  <span>Portugal Golden Visa (Michael Anderson)</span>
                  <b>93% Success Velocity</b>
                </li>
                <li>
                  <span>UAE Golden Visa & DIFC (Sarah Williams)</span>
                  <b>90% Success Velocity</b>
                </li>
                <li>
                  <span>Canada SUV & Federal Residency (David Miller)</span>
                  <b>86% Success Velocity</b>
                </li>
                <li>
                  <span>Swiss Cantonal Lump-sum Residency (Elena Rostova)</span>
                  <b>88% Success Velocity</b>
                </li>
              </ul>
            </div>

            <div className="modal-actions" style={{ marginTop: "24px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsReportsOpen(false)}
              >
                Close Report
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
