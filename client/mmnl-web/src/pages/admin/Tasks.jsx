import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useGet, useSend } from "../../lib/hooks.js";
import { hasDept } from "../../lib/perm.js";
import { Badge, Button, Card, Empty, FormModal, Load, PageTitle, Select, Tabs } from "../../ui/index.jsx";
import { DEPARTMENTS } from "../../config.js";
import { fmtDate, label } from "../../lib/format.js";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

function TaskCard({ t, move }) {
  const i = STATUSES.indexOf(t.status);
  return (
    <Card className="p-4">
      <div className="font-semibold">{t.title}</div>
      {t.description && <p className="text-sm text-ink-soft">{t.description}</p>}
      <p className="mt-1 text-sm text-ink-soft">{t.assigneeName || "Unassigned"}{t.dueDate && ` · due ${fmtDate(t.dueDate, { dateStyle: "medium" })}`}</p>
      {t.canUpdateStatus && (
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="outline" disabled={i === 0} aria-label={`Move ${t.title} back`} onClick={() => move(t, STATUSES[i - 1])}>←</Button>
          <Button size="sm" variant="outline" disabled={i === 2} aria-label={`Move ${t.title} forward`} onClick={() => move(t, STATUSES[i + 1])}>→</Button>
        </div>
      )}
    </Card>
  );
}

export function Tasks() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const depts = ["PROMOTION", "DECORATION"].filter((d) => hasDept(user, eventId, d));
  const [dept, setDept] = useState(depts[0]);
  const [view, setView] = useState(dept === "DECORATION" ? "board" : "list");
  const [m, setM] = useState(false);
  const q = useGet(`/api/v1/admin/events/${eventId}/tasks?department=${dept}`);
  const people = useGet(m ? `/api/v1/admin/events/${eventId}/assignees?department=${dept}` : null);
  const post = useSend("POST", { message: "Task added", onDone: () => setM(false) });
  const patch = useSend("PUT");
  const move = (t, status) => patch.mutate({ path: `/api/v1/admin/tasks/${t.id}/status`, body: { status } });
  const admin = hasDept(user, eventId, dept, "ADMIN");
  return (
    <>
      <PageTitle title="Tasks">
        {depts.length > 1 && <div className="w-44"><Select aria-label="Department" value={dept} onChange={(e) => setDept(e.target.value)}>{depts.map((d) => <option key={d} value={d}>{DEPARTMENTS[d]}</option>)}</Select></div>}
        {admin && <Button onClick={() => setM(true)}>Add task</Button>}
      </PageTitle>
      <Tabs tabs={[["list", "List"], ["board", "Board"]]} value={view} onChange={setView} />
      <Load q={q}>{(l) => l.length === 0 ? <Empty>No tasks yet.</Empty> : view === "board" ? (
        <div className="grid gap-4 md:grid-cols-3">{STATUSES.map((s) => (
          <section key={s} aria-label={label(s)}><h2 className="mb-2 text-lg">{label(s)} <span className="text-ink-soft">({l.filter((t) => t.status === s).length})</span></h2>
            <div className="space-y-3">{l.filter((t) => t.status === s).map((t) => <TaskCard key={t.id} t={t} move={move} />)}</div></section>))}</div>
      ) : (
        <div className="card overflow-x-auto p-0"><table className="tbl"><thead><tr><th>Task</th><th>Assigned to</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>{l.map((t) => (
            <tr key={t.id}><td><b>{t.title}</b>{t.description && <div className="text-sm text-ink-soft">{t.description}</div>}</td><td>{t.assigneeName || "–"}</td><td>{t.dueDate ? fmtDate(t.dueDate, { dateStyle: "medium" }) : "–"}</td>
              <td>{t.canUpdateStatus ? <Select aria-label={`Status of ${t.title}`} value={t.status} onChange={(e) => move(t, e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select> : <Badge status={t.status} />}</td></tr>))}</tbody></table></div>
      )}</Load>
      {m && <FormModal title="Add task" onClose={() => setM(false)} pending={post.isPending} error={post.error}
        fields={[{ k: "title", label: "Task", required: true }, { k: "description", type: "textarea", label: "Details" },
          { k: "assigneeId", type: "select", label: "Assign to", options: [{ value: "", label: "Unassigned" }, ...(people.data || []).map((p) => ({ value: p.userId, label: p.name }))] },
          { k: "dueDate", type: "date", label: "Due" }]}
        onSubmit={(v) => post.mutate({ path: `/api/v1/admin/events/${eventId}/tasks`, body: { ...v, department: dept, assigneeId: v.assigneeId || null, dueDate: v.dueDate || null } })} />}
    </>
  );
}

export function MyTasks() {
  const q = useGet("/api/v1/me/tasks");
  const patch = useSend("PUT");
  return (
    <>
      <PageTitle title="My tasks" sub="Everything assigned to you, across events." />
      <Load q={q}>{(l) => l.length === 0 ? <Empty>Nothing assigned to you.</Empty> : (
        <div className="card overflow-x-auto p-0"><table className="tbl"><thead><tr><th>Task</th><th>Event</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>{l.map((t) => (
            <tr key={t.id}><td><b>{t.title}</b><div className="text-sm text-ink-soft">{DEPARTMENTS[t.department]}</div></td><td><Link to={`/admin/e/${t.eventId}`}>{t.eventTitle}</Link></td><td>{t.dueDate ? fmtDate(t.dueDate, { dateStyle: "medium" }) : "–"}</td>
              <td><Select aria-label={`Status of ${t.title}`} value={t.status} onChange={(e) => patch.mutate({ path: `/api/v1/admin/tasks/${t.id}/status`, body: { status: e.target.value } })}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></td></tr>))}</tbody></table></div>
      )}</Load>
    </>
  );
}
