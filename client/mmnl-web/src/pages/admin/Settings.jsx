import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGet, useSend } from "../../lib/hooks.js";
import { uploadFile } from "../../lib/upload.js";
import { Badge, Button, Card, ErrorNote, Field, Input, Load, PageTitle, Select, Textarea, Progress } from "../../ui/index.jsx";
import { fromInput, toInput } from "../../lib/format.js";

function EventForm({ initial, eventId, onSave, saving, error }) {
  const [f, setF] = useState({
    title: "", description: "", venue: "", ticketTailorUrl: "", ticketTailorRef: "", capacity: "", refundable: false, bannerKey: undefined,
    ...initial, startsAt: toInput(initial?.startsAt), endsAt: toInput(initial?.endsAt),
    registrationDeadline: toInput(initial?.registrationDeadline), audioDeadline: toInput(initial?.audioDeadline),
  });
  const [pct, setPct] = useState(null);
  const [upErr, setUpErr] = useState(null);
  const file = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const banner = async (fl) => {
    if (!fl) return;
    setUpErr(null);
    try { setPct(0); const key = await uploadFile({ eventId, purpose: "BANNER", file: fl, onProgress: setPct }); setF((x) => ({ ...x, bannerKey: key })); }
    catch (e) { setUpErr(e); } finally { setPct(null); }
  };
  const save = () => onSave({
    title: f.title, description: f.description, venue: f.venue, ticketTailorUrl: f.ticketTailorUrl, ticketTailorRef: f.ticketTailorRef,
    capacity: f.capacity === "" ? null : Number(f.capacity), refundable: f.refundable, bannerKey: f.bannerKey,
    startsAt: fromInput(f.startsAt), endsAt: fromInput(f.endsAt),
    registrationDeadline: fromInput(f.registrationDeadline), audioDeadline: fromInput(f.audioDeadline),
  });
  return (
    <div className="max-w-3xl space-y-4">
      <Card className="space-y-4">
        <Field label="Title"><Input value={f.title} onChange={set("title")} /></Field>
        <Field label="Description"><Textarea value={f.description} onChange={set("description")} /></Field>
        <Field label="Venue"><Input value={f.venue} onChange={set("venue")} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starts (Amsterdam time)"><Input type="datetime-local" value={f.startsAt} onChange={set("startsAt")} /></Field>
          <Field label="Ends (Amsterdam time)"><Input type="datetime-local" value={f.endsAt} onChange={set("endsAt")} /></Field>
          <Field label="Performance registration deadline"><Input type="datetime-local" value={f.registrationDeadline} onChange={set("registrationDeadline")} /></Field>
          <Field label="Music upload deadline"><Input type="datetime-local" value={f.audioDeadline} onChange={set("audioDeadline")} /></Field>
        </div>
      </Card>
      <Card className="space-y-4">
        <h2 className="text-xl">Ticketing</h2>
        <Field label="Ticket Tailor link" hint="Where the “Get tickets” button sends people."><Input type="url" value={f.ticketTailorUrl || ""} onChange={set("ticketTailorUrl")} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ticket Tailor event ID"><Input value={f.ticketTailorRef || ""} onChange={set("ticketTailorRef")} /></Field>
          <Field label="Capacity"><Input type="number" min="0" value={f.capacity ?? ""} onChange={set("capacity")} /></Field>
        </div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.refundable} onChange={set("refundable")} /> Tickets are refundable (only changes the notice on the event page)</label>
      </Card>
      {eventId && (
        <Card>
          <h2 className="mb-2 text-xl">Banner image</h2>
          {f.bannerUrl && <img src={f.bannerUrl} alt="" className="mb-3 h-32 rounded object-cover" />}
          <label className="btn btn-outline btn-sm cursor-pointer">Choose image<input ref={file} type="file" accept="image/*" className="sr-only" onChange={(e) => banner(e.target.files[0])} /></label>
          {f.bannerKey && <span className="ml-3 text-sm text-tulsi">Uploaded. Save to apply.</span>}
          {pct !== null && <div className="mt-2"><Progress value={pct} max={1} /></div>}
          <div className="mt-2"><ErrorNote error={upErr} /></div>
        </Card>
      )}
      <ErrorNote error={error} />
      <Button loading={saving} disabled={!f.title || !f.startsAt} onClick={save}>Save event</Button>
    </div>
  );
}

export function EventNew() {
  const nav = useNavigate();
  const create = useSend("POST", { message: "Event created", onDone: (d) => nav(`/admin/e/${d.id}/settings`) });
  return (
    <>
      <PageTitle title="New event" sub="It stays a draft until you publish it." />
      <EventForm onSave={(body) => create.mutate({ path: "/api/v1/admin/events", body })} saving={create.isPending} error={create.error} />
    </>
  );
}

export function Settings() {
  const { eventId } = useParams();
  const q = useGet(`/api/v1/admin/events/${eventId}`);
  const update = useSend("PUT", { message: "Event saved" });
  const status = useSend("POST", { message: "Status updated" });
  return (
    <Load q={q}>{(e) => (
      <>
        <PageTitle title="Event settings"><Badge status={e.status} /></PageTitle>
        <Card className="mb-6 max-w-3xl">
          <h2 className="mb-2 text-xl">Visibility</h2>
          <p className="mb-3 text-ink-soft">Draft events are only visible to organisers. Published events appear on the public site.</p>
          <ErrorNote error={status.error} />
          <div className="mt-2 flex flex-wrap gap-2">
            {e.status === "DRAFT" && <Button loading={status.isPending} onClick={() => status.mutate({ path: `/api/v1/admin/events/${eventId}/status`, body: { status: "PUBLISHED" } })}>Publish event</Button>}
            {e.status === "PUBLISHED" && <>
              <Button variant="outline" loading={status.isPending} onClick={() => status.mutate({ path: `/api/v1/admin/events/${eventId}/status`, body: { status: "DRAFT" } })}>Unpublish</Button>
              <Button variant="dark" loading={status.isPending} onClick={() => status.mutate({ path: `/api/v1/admin/events/${eventId}/status`, body: { status: "COMPLETED" } })}>Mark as completed</Button>
            </>}
          </div>
        </Card>
        <EventForm key={e.updatedAt || e.id} initial={e} eventId={eventId} saving={update.isPending} error={update.error}
          onSave={(body) => update.mutate({ path: `/api/v1/admin/events/${eventId}`, body })} />
      </>
    )}</Load>
  );
}
