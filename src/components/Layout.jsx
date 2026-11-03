import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, ClipboardList, Users, CalendarDays, Activity, Menu, X, Bell, ChevronRight, ShieldCheck } from "lucide-react";
const nav = [
  { to:"/", label:"Overview", icon:LayoutDashboard, end:true },
  { to:"/questionnaire", label:"K&Q Questionnaire", icon:ClipboardList },
  { to:"/advisors", label:"Advisors", icon:Users },
  { to:"/meetings", label:"Meetings", icon:CalendarDays },
  { to:"/activity", label:"Activity", icon:Activity }
];
const titles = { "/":"Overview", "/questionnaire":"K&Q Questionnaire", "/advisors":"Advisor directory", "/meetings":"Meetings", "/activity":"Activity timeline" };
export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return <div className="app-shell">
    {open && <button className="mobile-scrim" aria-label="Close menu" onClick={()=>setOpen(false)} />}
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark">DJ</div><div><strong>DJ IMMIGRATION</strong><span>INVESTOR PORTAL</span></div><button className="icon-btn mobile-close" onClick={()=>setOpen(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(({to,label,icon:Icon,end})=><NavLink key={to} to={to} end={end} onClick={()=>setOpen(false)} className={({isActive})=>`nav-link ${isActive?"active":""}`}><Icon size={18}/><span>{label}</span><ChevronRight className="nav-chevron" size={15}/></NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="secure-icon"><ShieldCheck size={17}/></div><div><b>Private demo workspace</b><span>Fictional records only</span></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="icon-btn menu-trigger" onClick={()=>setOpen(true)}><Menu size={20}/></button><div className="crumb"><span>Workspace</span><ChevronRight size={14}/><strong>{titles[location.pathname] || "Investor Portal"}</strong></div><div className="topbar-right"><span className="demo-pill"><i/> Demo environment</span><button className="icon-btn notification" aria-label="Notifications"><Bell size={18}/><i/></button><div className="user-chip"><div className="user-avatar">JS</div><div><b>Jordan Smith</b><span>Investor account</span></div></div></div></header>
      <div className="page-wrap"><Outlet/></div>
      <footer className="footer"><span>© 2026 DJ Immigration · Investor Portal Demo</span><span>Training environment · Not for production use</span></footer>
    </main>
  </div>;
}