import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGet, useSend } from "../../lib/hooks.js";
import { Badge, Button, Empty, FormModal, Load, Modal, PageTitle, ErrorNote } from "../../ui/index.jsx";
import { DEPARTMENTS } from "../../config.js";
import { label } from "../../lib/format.js";

const FIELDS = (isNew) => [
  ...(isNew ? [{ k: "email", type: "email", label: "Google email", required: true, hint: "They get access the first time they sign in with this address." }] : []),
  { k: "department", type: "select", label: "Role", options: [{ value: "", label: "Event Admin (whole event)" }, ...Object.entries(DEPARTMENTS).map(([value, l]) => ({ value, label: l }))] },
  { k: "level", type: "select", label: "Level (departments only)", options: ["MEMBER", "ADMIN"] },
  { k: "financeAccess", type: "select", label: "Finance access", options: ["NONE", "OWN_DEPARTMENT", "WHOLE_EVENT"] },
];

export default function Team() {
  const { eventId } = useParams();
  const q = useGet(`/api/v1/admin/events/${eventId}/roles`);
  const [m, setM] = useState(null);
  const [revoke, setRevoke] = useState(null);
  const post = useSend("POST", { message: "Role added", onDone: () => setM(null) });
  const put = useSend("PUT", { message: "Role updated", onDone: () => setM(null) });
  const del = useSend("DELETE", { message: "Access revoked", onDone: () => setRevoke(null) });
  const body = (v) => ({ ...v, department: v.department || null, level: v.department ? v.level : "ADMIN" });
  return (
    <>
      <PageTitle title="Team" sub="Who can do what for this event."><Button onClick={() => setM({})}>Add person</Button></PageTitle>
      <Load q={q}>{(l) => l.length === 0 ? <Empty>No roles yet.</Empty> : (
        <div className="card overflow-x-auto p-0"><table className="tbl"><thead><tr><th>Person</th><th>Role</th><th>Finance</th><th>Status</th><th /></tr></thead>
          <tbody>{l.map((r) => (
            <tr key={r.id}><td>{r.name || "Not signed in yet"}<div className="text-sm text-ink-soft">{r.email}</div></td>
              <td>{r.department ? `${DEPARTMENTS[r.department]} ${label(r.level).toLowerCase()}` : "Event Admin"}</td><td>{label(r.financeAccess)}</td><td><Badge status={r.status || "ACTIVE"} /></td>
              <td><span className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setM(r)}>Edit</Button><Button size="sm" variant="outline" onClick={() => setRevoke(r)}>Revoke</Button></span></td></tr>))}</tbody></table></div>
      )}</Load>
      {m && <FormModal title={m.id ? "Edit role" : "Add person"} fields={FIELDS(!m.id)} initial={m.id ? { ...m, department: m.department || "" } : { level: "MEMBER", financeAccess: "NONE", department: "CULTURAL" }}
        onClose={() => setM(null)} pending={post.isPending || put.isPending} error={post.error || put.error}
        onSubmit={(v) => m.id ? put.mutate({ path: `/api/v1/admin/roles/${m.id}`, body: body(v) }) : post.mutate({ path: `/api/v1/admin/events/${eventId}/roles`, body: body(v) })} />}
      {revoke && (
        <Modal title="Revoke access?" onClose={() => setRevoke(null)}>
          <p className="mb-4">{revoke.name || revoke.email} will lose this role immediately.</p><ErrorNote error={del.error} />
          <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setRevoke(null)}>Cancel</Button><Button variant="danger" loading={del.isPending} onClick={() => del.mutate({ path: `/api/v1/admin/roles/${revoke.id}` })}>Revoke access</Button></div>
        </Modal>
      )}
    </>
  );
}
