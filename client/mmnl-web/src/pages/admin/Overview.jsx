import { useParams } from "react-router-dom";
import { useGet } from "../../lib/hooks.js";
import { Card, Empty, Load, PageTitle, Progress, Stat } from "../../ui/index.jsx";
import { fmtDateTime, label, money } from "../../lib/format.js";

export default function Overview() {
  const { eventId } = useParams();
  const ev = useGet(`/api/v1/admin/events/${eventId}`);
  const q = useGet(`/api/v1/admin/events/${eventId}/overview`);
  return (
    <>
      <PageTitle title={ev.data?.title || "Overview"} sub={ev.data ? label(ev.data.status) : ""} />
      <Load q={q}>{(o) => (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {o.ticketsSold != null && <Stat label="Tickets sold" value={o.ticketsSold} hint={o.capacity ? `of ${o.capacity}` : undefined} />}
            {o.checkedIn != null && <Stat label="Checked in" value={o.checkedIn} />}
            {o.ticketRevenueCents != null && <Stat label="Ticket revenue" value={money(o.ticketRevenueCents)} />}
            {o.sponsorPaidCents != null && <Stat label="Sponsor income received" value={money(o.sponsorPaidCents)} />}
            {o.performances && <Stat label="Acts approved" value={o.performances.approved} hint={`${o.performances.registered} registered`} />}
            {o.performances && <Stat label="Tracks approved" value={o.performances.audioApproved} />}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-xl">Tickets by type</h2>
              {(o.ticketsByType || []).length === 0 ? <p className="text-ink-soft">No tickets yet.</p> : o.ticketsByType.map((t) => (
                <div key={t.type} className="mb-3"><div className="mb-1 flex justify-between"><span>{t.type}</span><b>{t.count}</b></div><Progress value={t.count} max={o.ticketsSold || 1} /></div>
              ))}
            </Card>
            <Card>
              <h2 className="mb-3 text-xl">Recent activity</h2>
              {(o.activity || []).length === 0 ? <p className="text-ink-soft">Nothing yet.</p> : (
                <ul className="space-y-2">{o.activity.map((a, i) => <li key={i}><span className="text-sm text-ink-soft">{fmtDateTime(a.at)}</span><br />{a.actor} {a.action}</li>)}</ul>
              )}
            </Card>
          </div>
        </div>
      )}</Load>
    </>
  );
}
