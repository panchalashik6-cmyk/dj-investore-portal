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

  const currentSubmission = submissions[0] || null;
  const selectedAdvisorId = selections.length ? selections[selections.length - 1].advisorId : null;
  const selectedAdvisor = advisors.find(a => String(a.id) === String(selectedAdvisorId)) || null;
  const value = { advisors, meetings, submissions, selections, activities, loading, apiError, refresh, currentSubmission, selectedAdvisor };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export const useApp = () => useContext(AppContext);
