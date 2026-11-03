import { CheckCircle2, CalendarDays, ClipboardList, UserRound, Sparkles } from "lucide-react";
const icons={meeting:CalendarDays,questionnaire:ClipboardList,advisor:UserRound,system:Sparkles};
export default function ActivityTimeline({items=[]}) {
  const sorted=[...items].sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!sorted.length) return <div className="empty-state"><b>No activity yet</b><p>Updates will appear here as you use the portal.</p></div>;
  return <div className="timeline">{sorted.map(item=>{const Icon=icons[item.type]||CheckCircle2;return <div className="timeline-item" key={item.id}><div className="timeline-icon"><Icon size={16}/></div><div className="timeline-copy"><b>{item.title}</b><p>{item.description}</p><time>{new Date(item.date).toLocaleString([], {dateStyle:"medium",timeStyle:"short"})}</time></div></div>;})}</div>;
}