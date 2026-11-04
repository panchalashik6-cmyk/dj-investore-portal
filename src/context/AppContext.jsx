import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getAdvisors, getMeetings, getSelections, getSubmissions, getActivities, getErrorMessage } from "../api/client";

const AppContext = createContext(null);
export function AppProvider({ children }) {
  const [advisors, setAdvisors] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selections, setSelections] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setApiError("");
    try {
      const [a, m, s, sel, act] = await Promise.all([getAdvisors(), getMeetings(), getSubmissions(), getSelections(), getActivities()]);
      setAdvisors(a.data); setMeetings(m.data); setSubmissions(s.data); setSelections(sel.data); setActivities(act.data);
    } catch (e) { setApiError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  // Retrieve latest submission with local persistence fallback
  let currentSubmission = null;
  if (submissions.length > 0) {
    const sorted = [...submissions].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
    currentSubmission = sorted[0];
  }
  try {
    const local = localStorage.getItem("dj_kq_submission_backup");
    if (local) {
      const parsed = JSON.parse(local);
      if (
        !currentSubmission ||
        (parsed.status !== "Draft" && currentSubmission.status === "Draft") ||
        new Date(parsed.updatedAt || 0) > new Date(currentSubmission?.updatedAt || 0)
      ) {
        currentSubmission = parsed;
      }
    }
  } catch (_) {}

  const selectedAdvisorId = selections.length ? selections[selections.length - 1].advisorId : null;
  const selectedAdvisor = advisors.find(a => String(a.id) === String(selectedAdvisorId)) || null;
  const value = { advisors, meetings, submissions, selections, activities, loading, apiError, refresh, currentSubmission, selectedAdvisor };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export const useApp = () => useContext(AppContext);
