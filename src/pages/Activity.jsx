import { useApp } from "../context/AppContext";
import { PageTitle, Loading, ErrorState, EmptyState } from "../components/UI";
import ActivityTimeline from "../components/ActivityTimeline";
export default function Activity() {
 const {activities,loading,apiError,refresh}=useApp();
 if(loading)return <Loading label="Loading activity history"/>;
 if(apiError)return <ErrorState message={apiError} onRetry={refresh}/>;
 return <><PageTitle eyebrow="AUDIT TRAIL" title="Activity timeline" description="A chronological view of the key actions and updates in your demo investor journey." action={<span className="subtle-tag">{activities.length} events</span>}/><section className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">ALL UPDATES</span><h3>Your journey history</h3></div><span className="muted-small">Newest first</span></div>{activities.length?<ActivityTimeline items={activities}/>:<EmptyState title="No activity recorded" description="Your portal actions will be captured here."/>}</section><div className="notice notice-info">This activity feed uses fictional records and mock advisor actions for frontend practice.</div></>;
}