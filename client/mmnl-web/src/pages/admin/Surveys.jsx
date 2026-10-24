import { useParams } from "react-router-dom";
import { useGet, useSend } from "../../lib/hooks.js";
import { Badge, Button, Card, Empty, ErrorNote, Load, PageTitle, Progress, Stat } from "../../ui/index.jsx";

const ROWS = [["overall", "Overall"], ["food", "Food"], ["cultural", "Cultural programme"], ["venue", "Venue"]];
export default function Surveys() {
  const { eventId } = useParams();
  const q = useGet(`/api/v1/admin/events/${eventId}/survey-results`);
  const st = useSend("POST", { message: "Survey updated" });
  const set = (status) => st.mutate({ path: `/api/v1/admin/events/${eventId}/survey/status`, body: { status } });
  return (
    <>
      <PageTitle title="Feedback survey" sub="Only people who checked in can respond.">
        <Load q={q}>{(r) => <>
          <Badge status={r.status} />
          {r.status !== "OPEN" && <Button loading={st.isPending} onClick={() => set("OPEN")}>{r.status === "CLOSED" ? "Reopen survey" : "Open survey"}</Button>}
          {r.status === "OPEN" && <Button variant="dark" loading={st.isPending} onClick={() => set("CLOSED")}>Close survey</Button>}
        </>}</Load>
      </PageTitle>
      <ErrorNote error={st.error} />
      <Load q={q}>{(r) => (
        <div className="space-y-6">
          <Stat label="Responses" value={r.responseCount} />
          <Card><h2 className="mb-3 text-xl">Average ratings</h2>
            {ROWS.map(([k, l]) => <div key={k} className="mb-3"><div className="mb-1 flex justify-between"><span>{l}</span><b>{r.averages?.[k] != null ? r.averages[k].toFixed(1) : "–"} / 5</b></div><Progress value={r.averages?.[k] || 0} max={5} /></div>)}</Card>
          <section><h2 className="mb-3 text-xl">Comments</h2>{(r.comments || []).length === 0 ? <Empty>No comments yet.</Empty> : r.comments.map((c, i) => <Card key={i} className="mb-3 whitespace-pre-line">{c}</Card>)}</section>
        </div>
      )}</Load>
    </>
  );
}
