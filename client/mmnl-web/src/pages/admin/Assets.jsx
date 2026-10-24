import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext.jsx";
import { api } from "../../lib/api.js";
import { useGet, useSend } from "../../lib/hooks.js";
import { uploadFile } from "../../lib/upload.js";
import { isEA, rolesFor } from "../../lib/perm.js";
import { Button, Card, Empty, ErrorNote, Field, Load, PageTitle, Progress, Select } from "../../ui/index.jsx";
import { ASSET_CATEGORIES, DEPARTMENTS, MAX_ASSET_MB } from "../../config.js";
import { fmtDateTime, label } from "../../lib/format.js";

export default function Assets() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [cat, setCat] = useState("");
  const [upCat, setUpCat] = useState("FLYER");
  const myDepts = isEA(user, eventId) ? Object.keys(DEPARTMENTS) : rolesFor(user, eventId).map((r) => r.department).filter(Boolean);
  const [dept, setDept] = useState(myDepts[0] || "PROMOTION");
  const [pct, setPct] = useState(null);
  const [err, setErr] = useState(null);
  const input = useRef(null);
  const q = useGet(`/api/v1/admin/events/${eventId}/assets${cat ? `?category=${cat}` : ""}`);
  const del = useSend("DELETE", { message: "Deleted" });

  const upload = async (file) => {
    if (!file) return;
    setErr(null);
    if (file.size > MAX_ASSET_MB * 1024 * 1024) return setErr({ message: `The file is larger than ${MAX_ASSET_MB} MB.` });
    try {
      setPct(0);
      const storageKey = await uploadFile({ eventId, purpose: "ASSET", file, onProgress: setPct });
      await api(`/api/v1/admin/events/${eventId}/assets`, { method: "POST", body: { storageKey, filename: file.name, category: upCat, department: dept } });
      qc.invalidateQueries();
    } catch (e) { setErr(e); } finally { setPct(null); if (input.current) input.current.value = ""; }
  };
  return (
    <>
      <PageTitle title="Assets" sub="Shared flyers, logos and floor plans." />
      <Card className="mb-6 max-w-3xl">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Category"><Select value={upCat} onChange={(e) => setUpCat(e.target.value)}>{ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}</Select></Field>
          <Field label="Department"><Select value={dept} onChange={(e) => setDept(e.target.value)}>{myDepts.map((d) => <option key={d} value={d}>{DEPARTMENTS[d]}</option>)}</Select></Field>
          <div className="flex items-end"><label className="btn btn-primary cursor-pointer">Upload file<input ref={input} type="file" className="sr-only" onChange={(e) => upload(e.target.files[0])} /></label></div>
        </div>
        {pct !== null && <div className="mt-3"><Progress value={pct} max={1} /></div>}
        <div className="mt-3"><ErrorNote error={err} /></div>
      </Card>
      <div className="mb-4 w-48"><Select aria-label="Filter by category" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}</Select></div>
      <Load q={q}>{(l) => l.length === 0 ? <Empty>No files yet.</Empty> : (
        <div className="card overflow-x-auto p-0"><table className="tbl"><thead><tr><th>File</th><th>Category</th><th>Department</th><th>Uploaded</th><th /></tr></thead>
          <tbody>{l.map((a) => (
            <tr key={a.id}><td><a href={a.downloadUrl} target="_blank" rel="noopener noreferrer">{a.filename}</a></td><td>{label(a.category)}</td><td>{DEPARTMENTS[a.department] || "–"}</td><td className="text-sm">{a.uploadedBy}<br />{fmtDateTime(a.uploadedAt)}</td>
              <td>{a.canDelete && <Button size="sm" variant="outline" onClick={() => del.mutate({ path: `/api/v1/admin/assets/${a.id}` })}>Delete</Button>}</td></tr>))}</tbody></table></div>
      )}</Load>
      <ErrorNote error={del.error} />
    </>
  );
}
