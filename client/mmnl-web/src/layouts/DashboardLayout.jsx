import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useMatch, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useGet } from "../lib/hooks.js";
import { MODULES, isSA } from "../lib/perm.js";
import { ORG_SHORT } from "../config.js";

export default function DashboardLayout() {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const eventId = useMatch("/admin/e/:eventId/*")?.params.eventId;
  const events = useGet("/api/v1/admin/events");
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [loc.pathname]);
  const mods = eventId ? MODULES.filter((m) => m.test(user, eventId)) : [];
  const item = ({ isActive }) => `block rounded-md px-3 py-1.5 no-underline ${isActive ? "bg-saffron text-ink font-semibold" : "text-white/80 hover:bg-white/10"}`;
  return (
    <div className="min-h-screen md:flex">
      <div className="flex items-center justify-between bg-ink px-4 py-3 text-white md:hidden">
        <span className="font-display text-lg">{ORG_SHORT} admin</span>
        <button className="btn btn-outline btn-sm border-white/40 text-white" onClick={() => setOpen(!open)} aria-expanded={open}>Menu</button>
      </div>
      <aside className={`${open ? "block" : "hidden"} bg-ink p-4 text-white md:block md:w-64 md:shrink-0`}>
        <Link to="/admin" className="mb-4 hidden font-display text-xl text-white no-underline md:block">{ORG_SHORT} admin</Link>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-white/70">Event</span>
          <select className="input text-ink" value={eventId || ""} onChange={(e) => nav(e.target.value ? `/admin/e/${e.target.value}` : "/admin")}>
            <option value="">Choose an event…</option>
            {(events.data || []).map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </label>
        <nav className="space-y-1">
          {mods.map((m) => <NavLink key={m.id} end={m.path === ""} to={`/admin/e/${eventId}/${m.path}`} className={item}>{m.label}</NavLink>)}
        </nav>
        <nav className="mt-6 space-y-1 border-t border-white/15 pt-4">
          <NavLink to="/admin/my-tasks" className={item}>My tasks</NavLink>
          {isSA(user) && <NavLink to="/admin/events/new" className={item}>New event</NavLink>}
          {isSA(user) && <NavLink to="/admin/platform" className={item}>Platform admins</NavLink>}
          <Link to="/" className="block px-3 py-1.5 text-white/70 no-underline hover:text-white">Back to public site</Link>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8"><Outlet /></main>
    </div>
  );
}
