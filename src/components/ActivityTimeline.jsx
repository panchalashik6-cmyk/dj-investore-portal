import {
  CalendarDays,
  ClipboardList,
  UserRound,
  Sparkles,
  ShieldAlert,
  Clock,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const iconMap = {
  meeting: { icon: CalendarDays, tone: "tone-blue", label: "Consultation" },
  questionnaire: { icon: ClipboardList, tone: "tone-gold", label: "Questionnaire" },
  advisor: { icon: UserRound, tone: "tone-sage", label: "Counsel" },
  system: { icon: Sparkles, tone: "tone-sand", label: "System" },
  compliance: { icon: ShieldAlert, tone: "tone-rose", label: "Security" }
};

export default function ActivityTimeline({ items = [], maxItems }) {
  const sorted = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
  const displayed = maxItems ? sorted.slice(0, maxItems) : sorted;

  if (!sorted.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrap">
          <Clock size={24} />
        </div>
        <h3>No activity recorded yet</h3>
        <p>Your actions, submissions, and advisor updates will be securely audited here.</p>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {displayed.map((item, index) => {
        const config = iconMap[item.type] || iconMap.system;
        const Icon = config.icon;
        const dateObj = new Date(item.date);

        return (
          <div className="timeline-item" key={item.id || index}>
            <div className={`timeline-icon-bubble ${config.tone}`}>
              <Icon size={16} />
            </div>

            <div className="timeline-content-card">
              <div className="timeline-header-row">
                <div className="timeline-title-group">
                  <span className={`timeline-category-tag ${config.tone}`}>
                    {config.label}
                  </span>
                  <h4 className="timeline-title">{item.title}</h4>
                </div>
                <time className="timeline-time">
                  {dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}{" "}
                  at{" "}
                  {dateObj.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </time>
              </div>

              <p className="timeline-description">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
