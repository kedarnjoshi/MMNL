import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGet } from "../../lib/hooks.js";
import { Badge, Button, Empty, Input, Load, PageTitle, Pager, Stat } from "../../ui/index.jsx";
import { money } from "../../lib/format.js";

export default function Ticketing() {
  const { eventId } = useParams();
  const [term, setTerm] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const stats = useGet(`/api/v1/admin/events/${eventId}/ticket-stats`);
  const list = useGet(`/api/v1/admin/events/${eventId}/attendees?q=${encodeURIComponent(q)}&page=${page}`);
  return (
    <>
      <PageTitle title="Ticketing" sub="Read-only view of Ticket Tailor sales and check-ins." />
      <Load q={stats}>{(s) => (
        <div className="mb-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Sold" value={s.sold} /><Stat label="Checked in" value={s.checkedIn} /><Stat label="Cancelled" value={s.cancelled} /><Stat label="Revenue" value={money(s.revenueCents)} />
          </div>
          <div className="card overflow-x-auto"><table className="tbl"><thead><tr><th>Ticket type</th><th>Sold</th><th>Checked in</th><th>Revenue</th></tr></thead>
            <tbody>{(s.byType || []).map((t) => <tr key={t.type}><td>{t.type}</td><td>{t.sold}</td><td>{t.checkedIn}</td><td>{money(t.revenueCents)}</td></tr>)}</tbody></table></div>
        </div>
      )}</Load>
      <h2 className="mb-3 text-2xl">Attendees</h2>
      <form className="mb-4 flex max-w-lg gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); setQ(term); }}>
        <Input placeholder="Search by name, email or ticket ID" aria-label="Search attendees" value={term} onChange={(e) => setTerm(e.target.value)} />
        <Button type="submit" variant="dark">Search</Button>
      </form>
      <Load q={list}>{(d) => d.items.length === 0 ? <Empty>No attendees match.</Empty> : (
        <>
          <div className="card overflow-x-auto p-0"><table className="tbl"><thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Status</th><th>Ticket</th></tr></thead>
            <tbody>{d.items.map((a) => (
              <tr key={a.id}><td>{a.name}</td><td>{a.email}</td><td>{a.ticketType}{a.isComplimentary && " (comp)"}</td><td><Badge status={a.status} /></td><td className="text-sm text-ink-soft">{a.barcode}</td></tr>))}</tbody></table></div>
          <Pager page={page} total={d.total} onPage={setPage} />
        </>
      )}</Load>
    </>
  );
}
