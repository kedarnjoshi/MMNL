import { useState } from "react";
import { useGet, useSend } from "../../lib/hooks.js";
import { Button, Empty, FormModal, Load, PageTitle } from "../../ui/index.jsx";

export default function Platform() {
  const q = useGet("/api/v1/admin/platform/super-admins");
  const [open, setOpen] = useState(false);
  const post = useSend("POST", { message: "Super Admin added", onDone: () => setOpen(false) });
  const del = useSend("DELETE", { message: "Super Admin removed" });
  return (
    <>
      <PageTitle title="Platform admins" sub="Super Admins can manage every event. Assign Event Admins from each event's Team page."><Button onClick={() => setOpen(true)}>Add Super Admin</Button></PageTitle>
      <Load q={q}>{(l) => l.length === 0 ? <Empty>No Super Admins.</Empty> : (
        <div className="card overflow-x-auto p-0"><table className="tbl"><thead><tr><th>Person</th><th /></tr></thead>
          <tbody>{l.map((u) => <tr key={u.userId}><td>{u.name}<div className="text-sm text-ink-soft">{u.email}</div></td><td><Button size="sm" variant="outline" onClick={() => del.mutate({ path: `/api/v1/admin/platform/super-admins/${u.userId}` })}>Remove</Button></td></tr>)}</tbody></table></div>
      )}</Load>
      {open && <FormModal title="Add Super Admin" fields={[{ k: "email", type: "email", label: "Google email", required: true }]} onClose={() => setOpen(false)} pending={post.isPending} error={post.error || del.error}
        onSubmit={(v) => post.mutate({ path: "/api/v1/admin/platform/super-admins", body: v })} />}
    </>
  );
}
