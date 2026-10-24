import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGet } from "../../lib/hooks.js";
import { Empty, Load, PageTitle, Pager } from "../../ui/index.jsx";
import { fmtDateTime } from "../../lib/format.js";

export default function Audit() {
  const { eventId } = useParams();
  const [page, setPage] = useState(1);
  const q = useGet(`/api/v1/admin/events/${eventId}/audit-log?page=${page}`);
  return (
    <>
      <PageTitle title="Audit log" sub="Every admin action for this event." />
      <Load q={q}>{(d) => d.items.length === 0 ? <Empty>No activity yet.</Empty> : (
        <>
          <div className="card overflow-x-auto p-0"><table className="tbl"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>On</th></tr></thead>
            <tbody>{d.items.map((a) => <tr key={a.id}><td className="whitespace-nowrap">{fmtDateTime(a.at)}</td><td>{a.actor}</td><td>{a.action}</td><td className="text-sm text-ink-soft">{a.entityType} {a.entityId}</td></tr>)}</tbody></table></div>
          <Pager page={page} total={d.total} onPage={setPage} />
        </>
      )}</Load>
    </>
  );
}
