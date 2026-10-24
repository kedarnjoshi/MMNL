import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGet, useSend } from "../../lib/hooks.js";
import { Badge, Button, Empty, FormModal, Load, PageTitle } from "../../ui/index.jsx";
import { CAMPAIGN_STATUSES } from "../../config.js";
import { fmtDate } from "../../lib/format.js";

const FIELDS = [
  { k: "name", label: "Campaign", required: true },
  { k: "platform", label: "Platform", hint: "For example Instagram, WhatsApp, flyers.", required: true },
  { k: "status", type: "select", options: CAMPAIGN_STATUSES, label: "Status" },
  { k: "startsOn", type: "date", label: "Starts" }, { k: "endsOn", type: "date", label: "Ends" },
  { k: "notes", type: "textarea", label: "Notes" },
];

export default function Campaigns() {
  const { eventId } = useParams();
  const q = useGet(`/api/v1/admin/events/${eventId}/campaigns`);
  const [m, setM] = useState(null);
  const post = useSend("POST", { message: "Saved", onDone: () => setM(null) });
  const put = useSend("PUT", { message: "Saved", onDone: () => setM(null) });
  return (
    <>
      <PageTitle title="Promotion" sub="Campaigns across channels."><Button onClick={() => setM({})}>Add campaign</Button></PageTitle>
      <Load q={q}>{(l) => l.length === 0 ? <Empty>No campaigns yet.</Empty> : (
        <div className="card overflow-x-auto p-0"><table className="tbl"><thead><tr><th>Campaign</th><th>Platform</th><th>Dates</th><th>Status</th><th /></tr></thead>
          <tbody>{l.map((c) => (
            <tr key={c.id}><td><b>{c.name}</b>{c.notes && <div className="text-sm text-ink-soft">{c.notes}</div>}</td><td>{c.platform}</td><td className="whitespace-nowrap">{c.startsOn ? fmtDate(c.startsOn, { dateStyle: "medium" }) : "–"}{c.endsOn && ` – ${fmtDate(c.endsOn, { dateStyle: "medium" })}`}</td><td><Badge status={c.status} /></td>
              <td><Button size="sm" variant="outline" onClick={() => setM(c)}>Edit</Button></td></tr>))}</tbody></table></div>
      )}</Load>
      {m && <FormModal title={m.id ? "Edit campaign" : "Add campaign"} fields={FIELDS} initial={m.id ? m : { status: "SCHEDULED" }} onClose={() => setM(null)} pending={post.isPending || put.isPending} error={post.error || put.error}
        onSubmit={(v) => { const body = { ...v, startsOn: v.startsOn || null, endsOn: v.endsOn || null };
          m.id ? put.mutate({ path: `/api/v1/admin/campaigns/${m.id}`, body }) : post.mutate({ path: `/api/v1/admin/events/${eventId}/campaigns`, body }); }} />}
    </>
  );
}
