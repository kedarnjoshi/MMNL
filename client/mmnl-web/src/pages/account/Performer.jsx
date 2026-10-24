import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useGet } from "../../lib/hooks.js";
import { api } from "../../lib/api.js";
import { uploadFile } from "../../lib/upload.js";
import { Badge, Card, Empty, ErrorNote, Load, Progress } from "../../ui/index.jsx";
import { fmtDate, fmtDateTime, isPast } from "../../lib/format.js";
import { MAX_AUDIO_MB } from "../../config.js";

const OK_AUDIO = /\.(mp3|wav)$/i;

function AudioUpload({ p, eventId, deadline }) {
  const qc = useQueryClient();
  const input = useRef(null);
  const [pct, setPct] = useState(null);
  const [err, setErr] = useState(null);
  const locked = p.audio?.status === "APPROVED" || isPast(deadline);

  const pick = async (file) => {
    setErr(null);
    if (!file) return;
    if (!OK_AUDIO.test(file.name)) return setErr({ message: "Choose an MP3 or WAV file." });
    if (file.size > MAX_AUDIO_MB * 1024 * 1024) return setErr({ message: `The file is larger than ${MAX_AUDIO_MB} MB.` });
    try {
      setPct(0);
      const storageKey = await uploadFile({ eventId, purpose: "AUDIO", file, onProgress: setPct });
      await api(`/api/v1/performances/${p.id}/audio`, { method: "POST", body: { storageKey, filename: file.name, mime: file.type, sizeBytes: file.size } });
      qc.invalidateQueries();
    } catch (e) { setErr(e); } finally { setPct(null); if (input.current) input.current.value = ""; }
  };

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="mb-2 flex items-center gap-2"><b>Music track</b><Badge status={p.audio?.status || "NOT_UPLOADED"} /></div>
      {p.audio?.filename && <p className="text-sm text-ink-soft">{p.audio.filename}</p>}
      {p.audio?.url && <audio controls src={p.audio.url} className="my-2 w-full" />}
      {p.audio?.status === "CHANGES_REQUESTED" && p.audio.reviewerNote && <p className="my-2 rounded-md bg-kumkum/5 p-3 text-kumkum"><b>Changes requested:</b> {p.audio.reviewerNote}</p>}
      {locked ? <p className="text-sm text-ink-soft">{p.audio?.status === "APPROVED" ? "Your track is approved." : "The upload deadline has passed."}</p> : (
        <>
          <label className="btn btn-outline btn-sm cursor-pointer">
            {p.audio?.filename ? "Replace track" : "Upload track"}
            <input ref={input} type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" className="sr-only" onChange={(e) => pick(e.target.files[0])} />
          </label>
          <span className="ml-3 text-sm text-ink-soft">MP3 or WAV, up to {MAX_AUDIO_MB} MB</span>
        </>
      )}
      {pct !== null && <div className="mt-3"><Progress value={pct} max={1} /></div>}
      <div className="mt-2"><ErrorNote error={err} /></div>
    </div>
  );
}

const Step = ({ done, children }) => (
  <li className="flex items-center gap-2"><span aria-hidden className={`grid h-5 w-5 place-items-center rounded-full text-xs ${done ? "bg-tulsi text-white" : "border border-line"}`}>{done ? "✓" : ""}</span><span className="sr-only">{done ? "Done:" : "To do:"}</span>{children}</li>
);

export default function Performer() {
  const { eventId } = useParams();
  const q = useGet(`/api/v1/events/${eventId}/performer-area`);
  return (
    <Load q={q}>{(d) => (
      <div className="space-y-8">
        <div><h2 className="text-2xl">{d.event.title}</h2>{d.event.audioDeadline && <p className="text-ink-soft">Music upload deadline: {fmtDate(d.event.audioDeadline)}</p>}</div>
        {d.performances.length === 0 ? <Empty>You have no approved performances for this event.</Empty> : d.performances.map((p) => (
          <Card key={p.id}>
            <h3 className="mb-3 text-xl">{p.groupName}</h3>
            <ul className="space-y-1">
              <Step done>Registered and approved</Step>
              <Step done={p.consentComplete}>Consent complete for all participants</Step>
              <Step done={!!p.audio?.filename}>Music track uploaded</Step>
              <Step done={p.audio?.status === "APPROVED"}>Music track approved</Step>
            </ul>
            <AudioUpload p={p} eventId={eventId} deadline={d.event.audioDeadline} />
          </Card>
        ))}
        <section>
          <h3 className="mb-3 text-xl">Announcements</h3>
          {d.announcements.length === 0 ? <Empty>No announcements yet.</Empty> : d.announcements.map((a) => (
            <Card key={a.id} className="mb-3"><div className="font-semibold">{a.subject}</div><div className="mb-2 text-sm text-ink-soft">{fmtDateTime(a.sentAt)}</div><p className="whitespace-pre-line">{a.body}</p></Card>
          ))}
        </section>
      </div>
    )}</Load>
  );
}
