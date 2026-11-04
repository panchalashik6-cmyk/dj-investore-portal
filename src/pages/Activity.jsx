import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  CalendarDays,
  ClipboardList,
  UserRound,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Clock
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageTitle, Loading, ErrorState, EmptyState, Toast } from "../components/UI";
import ActivityTimeline from "../components/ActivityTimeline";

const categories = [
  { key: "all", label: "All Events" },
  { key: "meeting", label: "Consultations", icon: CalendarDays },
  { key: "questionnaire", label: "Questionnaire", icon: ClipboardList },
  { key: "advisor", label: "Legal Counsel", icon: UserRound },
  { key: "system", label: "System Audits", icon: Sparkles }
];

export default function Activity() {
  const { activities, loading, apiError, refresh } = useApp();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => {
    return activities.filter((item) => {
      const matchesType = filter === "all" || item.type === filter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.date.includes(q);
      return matchesType && matchesSearch;
    });
  }, [activities, filter, search]);

  const stats = useMemo(() => {
    return {
      all: activities.length,
      meeting: activities.filter((a) => a.type === "meeting").length,
      questionnaire: activities.filter((a) => a.type === "questionnaire").length,
      advisor: activities.filter((a) => a.type === "advisor").length,
      system: activities.filter((a) => a.type === "system").length
    };
  }, [activities]);

  const exportLog = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activities, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `dj-immigration-audit-trail-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setToast({
        message: "Audit trail log successfully exported to JSON.",
        type: "success"
      });
    } catch (e) {
      setToast({
        message: "Failed to export audit log.",
        type: "error"
      });
    }
  };

  if (loading) return <Loading label="Loading comprehensive audit trail" />;
  if (apiError) return <ErrorState message={apiError} onRetry={refresh} />;

  return (
    <>
      <PageTitle
        eyebrow="PORTFOLIO AUDIT TRAIL"
        title="Activity timeline & audit"
        description="A tamper-evident chronological ledger of all onboarding updates, questionnaire revisions, advisor assignments, and consultation milestones."
        action={
          <div className="activity-action-group">
            <span className="subtle-tag">{activities.length} Audited Events</span>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={exportLog}
              title="Export complete event log as JSON"
            >
              <Download size={14} /> Export Log
            </button>
          </div>
        }
      />

      {/* Activity Filter & Search Bar */}
      <div className="activity-controls-card panel">
        <div className="activity-search-row">
          <div className="activity-search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter timeline events by title, description keyword, or date..."
              className="activity-search-input"
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
        </div>

        <div className="activity-tabs-row">
          {categories.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`activity-tab-btn ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {Icon && <Icon size={14} />}
              <span>{label}</span>
              <span className="activity-tab-count">{stats[key] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Timeline Card */}
      <section className="panel activity-main-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">CHRONOLOGICAL LOG</span>
            <h3>Event Records</h3>
          </div>
          <span className="muted-small">Sorted newest first</span>
        </div>

        {filtered.length ? (
          <ActivityTimeline items={filtered} />
        ) : (
          <div className="empty-activity-wrap">
            <EmptyState
              icon={Clock}
              title="No Matching Events Found"
              description="No timeline events match your current filter and search parameters."
              action={
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setFilter("all");
                    setSearch("");
                  }}
                >
                  <RotateCcw size={14} /> Reset Filters
                </button>
              }
            />
          </div>
        )}
      </section>

      <div className="notice notice-info audit-disclaimer">
        <ShieldCheck size={18} />
        <div>
          <b>Compliance Audit Notice:</b>
          <p>
            All timestamps in this activity feed are cryptographically formatted and recorded in UTC
            ISO-8601 standard for regulatory compliance demonstration.
          </p>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
