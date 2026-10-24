import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useGet } from "../../lib/hooks.js";
import { isSA } from "../../lib/perm.js";
import { Badge, Card, Empty, Load, PageTitle } from "../../ui/index.jsx";
import { fmtDate } from "../../lib/format.js";

export default function AdminHome() {
  const { user } = useAuth();
  const q = useGet("/api/v1/admin/events");
  return (
    <Load q={q}>{(events) => {
      if (events.length === 1 && !isSA(user)) return <Navigate to={`/admin/e/${events[0].id}`} replace />;
      return (
        <>
          <PageTitle title="Events" sub="Choose an event to manage.">
            <Link to="/admin/my-tasks" className="btn btn-outline">My tasks</Link>
            {isSA(user) && <Link to="/admin/events/new" className="btn btn-primary">New event</Link>}
          </PageTitle>
          {events.length === 0 ? <Empty>No events yet.</Empty> : (
            <div className="grid gap-4 md:grid-cols-2">{events.map((e) => (
              <Link key={e.id} to={`/admin/e/${e.id}`} className="card block text-ink no-underline hover:border-saffron">
                <div className="mb-1 flex items-start justify-between gap-3"><h2 className="text-xl">{e.title}</h2><Badge status={e.status} /></div>
                <p className="text-ink-soft">{fmtDate(e.startsAt)} · {e.venue}</p>
              </Link>))}</div>
          )}
        </>
      );
    }}</Load>
  );
}
