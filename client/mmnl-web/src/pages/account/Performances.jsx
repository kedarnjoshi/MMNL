import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useGet, useSend } from "../../lib/hooks.js";
import { Badge, Button, Card, Empty, ErrorNote, Field, Input, Load, Modal, Select, Textarea } from "../../ui/index.jsx";
import { fmtDate, isPast } from "../../lib/format.js";

export function MyPerformances() {
  const mine = useGet("/api/v1/me/performances");
  const events = useGet("/api/v1/events?scope=upcoming");
  const withdraw = useSend("POST", { message: "Performance withdrawn" });
  const [confirm, setConfirm] = useState(null);
  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 text-2xl">Register a performance</h2>
        <Load q={events}>{(list) => {
          const open = list.filter((e) => e.registrationDeadline ? !isPast(e.registrationDeadline) : e.registrationOpen);
          return open.length === 0 ? <Empty>No events are taking performance registrations right now.</Empty> : (
            <div className="grid gap-3 sm:grid-cols-2">{open.map((e) => (
              <Card key={e.id} className="flex items-center justify-between gap-3">
                <div><div className="font-semibold">{e.title}</div><div className="text-sm text-ink-soft">{e.registrationDeadline ? `Register by ${fmtDate(e.registrationDeadline)}` : fmtDate(e.startsAt)}</div></div>
                <Link to={`/account/performances/new?eventId=${e.id}`} className="btn btn-primary btn-sm">Register</Link>
              </Card>))}</div>);
        }}</Load>
      </section>
      <section>
        <h2 className="mb-3 text-2xl">My performances</h2>
        <Load q={mine}>{(list) => list.length === 0 ? <Empty>You haven't registered a performance yet.</Empty> : (
          <div className="space-y-3">{list.map((p) => (
            <Card key={p.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{p.groupName}</div>
                  <div className="text-sm text-ink-soft">{p.eventTitle} · {p.type}</div>
                </div>
                <Badge status={p.status} />
              </div>
              {p.status === "REJECTED" && p.statusReason && <p className="mt-3 rounded-md bg-kumkum/5 p-3 text-kumkum"><b>Reason:</b> {p.statusReason}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`/account/performances/${p.id}`} className="btn btn-outline btn-sm">{["DRAFT", "REJECTED"].includes(p.status) ? "Edit and resubmit" : "View"}</Link>
                {p.status === "APPROVED" && <Link to={`/account/performer/${p.eventId}`} className="btn btn-primary btn-sm">Performer area</Link>}
                {["REGISTERED", "APPROVED"].includes(p.status) && <Button variant="outline" size="sm" onClick={() => setConfirm(p)}>Withdraw</Button>}
              </div>
            </Card>))}</div>)}</Load>
      </section>
      {confirm && (
        <Modal title="Withdraw this performance?" onClose={() => setConfirm(null)}>
          <p className="mb-4">{confirm.groupName} will be removed from the {confirm.eventTitle} programme. You can register again while registration is open.</p>
          <ErrorNote error={withdraw.error} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(null)}>Keep it</Button>
            <Button variant="danger" loading={withdraw.isPending} onClick={() => withdraw.mutate({ path: `/api/v1/performances/${confirm.id}/withdraw` }, { onSuccess: () => setConfirm(null) })}>Withdraw performance</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const blankPerson = () => ({ fullName: "", isMinor: false, guardianName: "", guardianEmail: "", consentGiven: false });
const TYPES = ["Dance", "Music", "Drama", "Fashion show", "Other"];

export function PerformanceForm() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const eventId = sp.get("eventId");
  const existing = useGet(id ? `/api/v1/performances/${id}` : null);
  const event = useGet(!id && eventId ? `/api/v1/events/${eventId}` : null);
  if (id) return <Load q={existing}>{(p) => <FormBody key={p.id} initial={p} eventTitle={p.eventTitle} />}</Load>;
  if (!eventId) return <Empty>Choose an event first from <Link to="/account/performances">My performances</Link>.</Empty>;
  return <Load q={event}>{(e) => <FormBody eventId={e.id} eventTitle={e.title} deadline={e.registrationDeadline} />}</Load>;
}

function FormBody({ initial, eventId, eventTitle, deadline }) {
  const nav = useNavigate();
  const editable = !initial || ["DRAFT", "REJECTED"].includes(initial.status);
  const [f, setF] = useState(initial || { groupName: "", type: TYPES[0], durationMinutes: 5, description: "", participants: [blankPerson()] });
  const [attest, setAttest] = useState(false);
  const [localErr, setLocalErr] = useState(null);
  const save = useSend(initial ? "PUT" : "POST", { message: "Saved" });
  const consentOut = useSend("POST", { message: "Consent withdrawn. The organisers have been told." });
  const set = (k, v) => setF({ ...f, [k]: v });
  const setP = (i, k, v) => set("participants", f.participants.map((p, j) => (j === i ? { ...p, [k]: v } : p)));
  const path = initial ? `/api/v1/performances/${initial.id}` : `/api/v1/events/${eventId}/performances`;

  const submit = (final) => {
    setLocalErr(null);
    if (final) {
      if (!f.groupName.trim()) return setLocalErr("Enter a group or act name.");
      if (f.participants.some((p) => !p.fullName.trim())) return setLocalErr("Every participant needs a name.");
      if (f.participants.some((p) => p.isMinor && (!p.guardianName || !p.guardianEmail))) return setLocalErr("Participants under 18 need a guardian name and email.");
      if (!attest) return setLocalErr("Please confirm the consent statement before submitting.");
    }
    save.mutate({ path, body: { ...f, durationMinutes: Number(f.durationMinutes), consentAttested: attest, submit: final } }, { onSuccess: () => nav("/account/performances") });
  };

  return (
    <div className="max-w-3xl">
      <h2 className="mb-1 text-2xl">{initial ? initial.groupName : "New performance"}</h2>
      <p className="mb-1 text-ink-soft">{eventTitle}{deadline ? ` · register by ${fmtDate(deadline)}` : ""}</p>
      {initial && <p className="mb-4"><Badge status={initial.status} /></p>}
      {initial?.status === "REJECTED" && initial.statusReason && <p className="mb-4 rounded-md bg-kumkum/5 p-3 text-kumkum"><b>Reason:</b> {initial.statusReason}</p>}
      <fieldset disabled={!editable} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Group or act name"><Input value={f.groupName} onChange={(e) => set("groupName", e.target.value)} /></Field>
          <Field label="Type"><Select value={f.type} onChange={(e) => set("type", e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
          <Field label="Duration (minutes)"><Input type="number" min="1" max="60" value={f.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} /></Field>
        </div>
        <Field label="Description" hint="What will you perform? Costume, props or stage needs are useful too."><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>

        <h3 className="pt-2 text-xl">Participants</h3>
        {f.participants.map((p, i) => (
          <Card key={p.id || i} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Field label="Full name"><Input value={p.fullName} onChange={(e) => setP(i, "fullName", e.target.value)} /></Field>
              <label className="flex items-end gap-2 pb-2"><input type="checkbox" checked={p.isMinor} onChange={(e) => setP(i, "isMinor", e.target.checked)} /> Under 18</label>
            </div>
            {p.isMinor && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Guardian name"><Input value={p.guardianName || ""} onChange={(e) => setP(i, "guardianName", e.target.value)} /></Field>
                <Field label="Guardian email"><Input type="email" value={p.guardianEmail || ""} onChange={(e) => setP(i, "guardianEmail", e.target.value)} /></Field>
              </div>
            )}
            <label className="flex items-start gap-2"><input type="checkbox" className="mt-1.5" checked={p.consentGiven} onChange={(e) => setP(i, "consentGiven", e.target.checked)} />
              <span>{p.isMinor ? "Their guardian agrees" : "They agree"} to photos and videos of this performance being used by MMNL.</span></label>
            {editable && f.participants.length > 1 && <Button variant="outline" size="sm" onClick={() => set("participants", f.participants.filter((_, j) => j !== i))}>Remove participant</Button>}
          </Card>
        ))}
        {editable && <Button variant="outline" onClick={() => set("participants", [...f.participants, blankPerson()])}>Add participant</Button>}
        {editable && (
          <label className="flex items-start gap-2 rounded-md bg-haldi p-3"><input type="checkbox" className="mt-1.5" checked={attest} onChange={(e) => setAttest(e.target.checked)} />
            <span>I confirm that every participant listed has agreed to the consent statement above, and that I'm authorised to register them.</span></label>
        )}
      </fieldset>
      {!editable && initial?.status !== "WITHDRAWN" && f.participants.some((p) => p.consentGiven) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {f.participants.filter((p) => p.id && p.consentGiven).map((p) => (
            <Button key={p.id} variant="outline" size="sm" onClick={() => consentOut.mutate({ path: `/api/v1/performances/${initial.id}/participants/${p.id}/consent-withdrawal` })}>Withdraw consent for {p.fullName}</Button>
          ))}
        </div>
      )}
      <div className="mt-4 space-y-3">
        {localErr && <p role="alert" className="text-kumkum">{localErr}</p>}
        <ErrorNote error={save.error || consentOut.error} />
        {editable && <div className="flex flex-wrap gap-2">
          <Button loading={save.isPending} onClick={() => submit(true)}>Submit for review</Button>
          <Button variant="outline" loading={save.isPending} onClick={() => submit(false)}>Save draft</Button>
        </div>}
        <Link to="/account/performances">Back to my performances</Link>
      </div>
    </div>
  );
}
