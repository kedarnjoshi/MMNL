import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useGet, useSend } from "../../lib/hooks.js";
import { hasDept } from "../../lib/perm.js";
import { Badge, Button, Card, Empty, ErrorNote, Field, Input, Load, Modal, PageTitle, Select, Tabs, Textarea } from "../../ui/index.jsx";
import { fmtDateTime, label } from "../../lib/format.js";

const consentCount = (p) => `${p.participants.filter((x) => x.consentGiven).length}/${p.participants.length}`;
const consentOk = (p) => p.participants.every((x) => x.consentGiven);

function ReviewModal({ p, onClose }) {
  const [reason, setReason] = useState("");
  const decide = useSend("POST", { message: "Decision saved. The registrant has been emailed.", onDone: onClose });
  const go = (decision) => decide.mutate({ path: `/api/v1/admin/performances/${p.id}/decision`, body: { decision, reason } });
  return (
    <Modal wide title={p.groupName} onClose={onClose}>
      <p className="mb-1 text-ink-soft">{p.type} · {p.durationMinutes} min · submitted by {p.submitterName} ({p.submitterEmail})</p>
      <p className="mb-4 whitespace-pre-line">{p.description}</p>
      <h3 className="mb-2 text-lg">Participants and consent</h3>
      <ul className="mb-4 space-y-1">{p.participants.map((x) => (
        <li key={x.id} className="flex flex-wrap items-center gap-2">{x.fullName}{x.isMinor && <Badge status="PENDING">Under 18: {x.guardianName}, {x.guardianEmail}</Badge>}
          <Badge status={x.consentGiven ? "COMPLETE" : "INCOMPLETE"}>{x.consentGiven ? "Consent given" : "No consent"}</Badge></li>))}</ul>
      {p.status === "REGISTERED" && (
        <>
          <Field label="Reason" hint="Required to reject. It is emailed to the registrant."><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
          <div className="mt-2"><ErrorNote error={decide.error} /></div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="danger" disabled={!reason.trim()} loading={decide.isPending} onClick={() => go("REJECT")}>Reject</Button>
            <Button loading={decide.isPending} onClick={() => go("APPROVE")}>Approve</Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function Registrations({ list }) {
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(null);
  const rows = list.filter((p) => p.status !== "DRAFT" && (!filter || p.status === filter));
  return (
    <>
      <div className="mb-4 max-w-xs"><Select aria-label="Filter by status" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All statuses</option>{["REGISTERED", "APPROVED", "REJECTED", "WITHDRAWN"].map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></div>
      {rows.length === 0 ? <Empty>No registrations match.</Empty> : (
        <div className="card overflow-x-auto p-0"><table className="tbl"><thead><tr><th>Act</th><th>Type</th><th>Min</th><th>Consent</th><th>Status</th><th /></tr></thead>
          <tbody>{rows.map((p) => (
            <tr key={p.id}><td className="font-semibold">{p.groupName}</td><td>{p.type}</td><td>{p.durationMinutes}</td>
              <td><Badge status={consentOk(p) ? "COMPLETE" : "INCOMPLETE"}>{consentCount(p)}</Badge>{p.consentWithdrawn && <span className="ml-2"><Badge status="REJECTED">Consent withdrawn</Badge></span>}</td>
              <td><Badge status={p.status} /></td><td><Button size="sm" variant="outline" onClick={() => setOpen(p)}>{p.status === "REGISTERED" ? "Review" : "Details"}</Button></td></tr>))}</tbody></table></div>
      )}
      {open && <ReviewModal p={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function AudioRow({ p }) {
  const [note, setNote] = useState("");
  const [ask, setAsk] = useState(false);
  const d = useSend("POST", { message: "Saved" });
  const go = (decision) => d.mutate({ path: `/api/v1/admin/performances/${p.id}/audio-decision`, body: { decision, reason: note } }, { onSuccess: () => setAsk(false) });
  const a = p.audio;
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2"><b>{p.groupName}</b><Badge status={a?.status || "NOT_UPLOADED"} /></div>
      {a?.url ? <audio controls src={a.url} className="my-3 w-full" /> : <p className="my-2 text-ink-soft">No track uploaded yet.</p>}
      {a?.url && a.status !== "APPROVED" && (
        <div className="flex gap-2"><Button size="sm" loading={d.isPending} onClick={() => go("APPROVE")}>Approve track</Button><Button size="sm" variant="outline" onClick={() => setAsk(!ask)}>Request changes</Button></div>
      )}
      {ask && <div className="mt-3 space-y-2"><Field label="What needs to change?"><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></Field><Button size="sm" disabled={!note.trim()} loading={d.isPending} onClick={() => go("REQUEST_CHANGES")}>Send request</Button></div>}
      <ErrorNote error={d.error} />
    </Card>
  );
}

function Lineup({ eventId, canManage }) {
  const q = useGet(`/api/v1/admin/events/${eventId}/lineup`);
  const [order, setOrder] = useState(null);
  const [override, setOverride] = useState("");
  const save = useSend("PUT", { message: "Running order saved" });
  const lock = useSend("POST", { message: "Lineup updated" });
  useEffect(() => { if (q.data) setOrder(q.data.items); }, [q.data]);
  if (!q.data || !order) return <Load q={q}>{() => null}</Load>;
  const move = (i, d) => { const o = [...order]; [o[i], o[i + d]] = [o[i + d], o[i]]; setOrder(o); };
  const total = order.reduce((s, x) => s + (x.durationMinutes || 0), 0);
  const warnings = order.some((x) => !x.audioApproved || !x.consentComplete);
  const locked = q.data.locked;
  return (
    <div className="max-w-3xl">
      <p className="mb-3 text-ink-soft">{order.length} acts · {total} minutes {locked && <Badge status="PUBLISHED">Locked</Badge>}</p>
      {order.length === 0 ? <Empty>No approved acts yet.</Empty> : (
        <ol className="space-y-2">{order.map((x, i) => (
          <li key={x.id} className="card flex items-center gap-3 py-3">
            <span className="w-6 text-ink-soft">{i + 1}</span>
            <span className="flex-1"><b>{x.groupName}</b> <span className="text-sm text-ink-soft">{x.durationMinutes} min</span>
              <span className="ml-2 inline-flex gap-1">{!x.audioApproved && <Badge status="CHANGES_REQUESTED">No approved track</Badge>}{!x.consentComplete && <Badge status="INCOMPLETE">Consent incomplete</Badge>}</span></span>
            {canManage && !locked && <span className="flex gap-1"><Button size="sm" variant="outline" aria-label={`Move ${x.groupName} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</Button><Button size="sm" variant="outline" aria-label={`Move ${x.groupName} down`} disabled={i === order.length - 1} onClick={() => move(i, 1)}>↓</Button></span>}
          </li>))}</ol>
      )}
      <ErrorNote error={save.error || lock.error} />
      <div className="mt-4 flex flex-wrap items-end gap-2">
        {canManage && !locked && <Button loading={save.isPending} onClick={() => save.mutate({ path: `/api/v1/admin/events/${eventId}/lineup`, body: { order: order.map((x) => x.id) } })}>Save order</Button>}
        {canManage && !locked && warnings && <div className="w-64"><Field label="Lock anyway: reason"><Input value={override} onChange={(e) => setOverride(e.target.value)} /></Field></div>}
        {canManage && <Button variant="dark" disabled={!locked && warnings && !override.trim()} loading={lock.isPending}
          onClick={() => lock.mutate({ path: `/api/v1/admin/events/${eventId}/lineup/lock`, body: { locked: !locked, overrideReason: override || null } })}>{locked ? "Unlock lineup" : "Lock lineup"}</Button>}
        <a className="btn btn-outline" href={`/api/v1/admin/events/${eventId}/lineup/export?format=csv`}>Export CSV</a>
        <a className="btn btn-outline" href={`/api/v1/admin/events/${eventId}/lineup/export?format=pdf`}>Export PDF</a>
      </div>
    </div>
  );
}

function Announcements({ eventId, canManage }) {
  const q = useGet(`/api/v1/admin/events/${eventId}/announcements`);
  const [f, setF] = useState({ subject: "", body: "" });
  const send = useSend("POST", { message: "Announcement sent to approved performers", onDone: () => setF({ subject: "", body: "" }) });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {canManage && (
        <Card className="space-y-3 self-start"><h2 className="text-xl">New announcement</h2>
          <p className="text-sm text-ink-soft">Sent by email to every approved performer and shown in their performer area.</p>
          <Field label="Subject"><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></Field>
          <Field label="Message"><Textarea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
          <ErrorNote error={send.error} />
          <Button disabled={!f.subject || !f.body} loading={send.isPending} onClick={() => send.mutate({ path: `/api/v1/admin/events/${eventId}/announcements`, body: f })}>Send announcement</Button></Card>
      )}
      <div><h2 className="mb-3 text-xl">Sent</h2><Load q={q}>{(l) => l.length === 0 ? <Empty>Nothing sent yet.</Empty> : l.map((a) => (
        <Card key={a.id} className="mb-3"><b>{a.subject}</b><div className="mb-1 text-sm text-ink-soft">{fmtDateTime(a.sentAt)} · {a.recipientCount} recipients</div><p className="whitespace-pre-line">{a.body}</p></Card>))}</Load></div>
    </div>
  );
}

export default function Cultural() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState("reg");
  const canManage = hasDept(user, eventId, "CULTURAL", "ADMIN");
  const q = useGet(`/api/v1/admin/events/${eventId}/performances`);
  return (
    <>
      <PageTitle title="Cultural" sub="Registrations, music tracks, running order and performer announcements." />
      <Tabs value={tab} onChange={setTab} tabs={[["reg", "Registrations"], ["audio", "Music tracks"], ["lineup", "Lineup"], ["news", "Announcements"]]} />
      {tab === "reg" && <Load q={q}>{(l) => <Registrations list={l} />}</Load>}
      {tab === "audio" && <Load q={q}>{(l) => { const a = l.filter((p) => p.status === "APPROVED"); return a.length === 0 ? <Empty>No approved acts yet.</Empty> : <div className="grid gap-4 md:grid-cols-2">{a.map((p) => <AudioRow key={p.id} p={p} />)}</div>; }}</Load>}
      {tab === "lineup" && <Lineup eventId={eventId} canManage={canManage} />}
      {tab === "news" && <Announcements eventId={eventId} canManage={canManage} />}
    </>
  );
}
