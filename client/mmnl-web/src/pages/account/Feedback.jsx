import { useState } from "react";
import { useGet, useSend } from "../../lib/hooks.js";
import { Button, Card, Empty, ErrorNote, Field, Load, RatingInput, Textarea } from "../../ui/index.jsx";

const QUESTIONS = [["overall", "Overall experience"], ["food", "Food"], ["cultural", "Cultural programme"], ["venue", "Venue"]];

function SurveyCard({ s }) {
  const [r, setR] = useState({ comment: "" });
  const send = useSend("POST", { message: "Thanks for your feedback" });
  if (s.submitted) return <Card><h2 className="text-xl">{s.eventTitle}</h2><p className="text-ink-soft">You've already sent your feedback. Thank you!</p></Card>;
  const ready = QUESTIONS.every(([k]) => r[k]);
  return (
    <Card>
      <h2 className="mb-1 text-xl">{s.eventTitle}</h2>
      <p className="mb-4 text-ink-soft">Rate each part from 1 (poor) to 5 (excellent). Your answers are anonymous to organisers.</p>
      <div className="space-y-4">
        {QUESTIONS.map(([k, l]) => <div key={k}><span className="label">{l}</span><RatingInput name={l} value={r[k]} onChange={(v) => setR({ ...r, [k]: v })} /></div>)}
        <Field label="Anything else? (optional)"><Textarea value={r.comment} onChange={(e) => setR({ ...r, comment: e.target.value })} /></Field>
        <ErrorNote error={send.error} />
        <Button loading={send.isPending} disabled={!ready} onClick={() => send.mutate({ path: `/api/v1/surveys/${s.id}/responses`, body: r })}>Send feedback</Button>
      </div>
    </Card>
  );
}

export default function Feedback() {
  const q = useGet("/api/v1/me/surveys");
  return (
    <Load q={q}>{(list) => list.length === 0
      ? <Empty>No surveys are open for you. After an event you attended, a short survey will appear here.</Empty>
      : <div className="space-y-5">{list.map((s) => <SurveyCard key={s.id} s={s} />)}</div>}</Load>
  );
}
