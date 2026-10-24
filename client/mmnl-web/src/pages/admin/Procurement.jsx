import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext.jsx";
import { api } from "../../lib/api.js";
import { useGet, useSend } from "../../lib/hooks.js";
import { uploadFile } from "../../lib/upload.js";
import { hasDept, isEA } from "../../lib/perm.js";
import { Badge, Button, Card, Empty, ErrorNote, Field, FormModal, Input, Load, Modal, PageTitle, Progress, Tabs } from "../../ui/index.jsx";
import { centsToEuros, eurosToCents, fmtDate, money } from "../../lib/format.js";
import { MAX_RECEIPT_MB } from "../../config.js";

function ExpenseModal({ claim, eventId, onClose }) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState(claim.expense ? centsToEuros(claim.expense.amountCents) : "");
  const [file, setFile] = useState(null);
  const [pct, setPct] = useState(null);
  const [err, setErr] = useState(null);
  const go = async () => {
    setErr(null);
    if (!file && !claim.expense) return setErr({ message: "Attach a photo or PDF of the receipt." });
    if (file && file.size > MAX_RECEIPT_MB * 1024 * 1024) return setErr({ message: `The receipt is larger than ${MAX_RECEIPT_MB} MB.` });
    try {
      setPct(0);
      const receiptKey = file ? await uploadFile({ eventId, purpose: "RECEIPT", file, onProgress: setPct }) : undefined;
      await api(`/api/v1/admin/procurement-claims/${claim.id}/expense`, { method: "POST", body: { amountCents: eurosToCents(amount), receiptKey } });
      qc.invalidateQueries(); onClose();
    } catch (e) { setErr(e); setPct(null); }
  };
  return (
    <Modal title="Submit expense" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Amount paid (€)"><Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        <Field label="Receipt" hint="Photo or PDF."><input type="file" accept="image/*,application/pdf" className="input" onChange={(e) => setFile(e.target.files[0])} /></Field>
        {pct !== null && <Progress value={pct} max={1} />}
        <ErrorNote error={err} />
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!amount} loading={pct !== null} onClick={go}>Submit expense</Button></div>
      </div>
    </Modal>
  );
}

const ITEM_FIELDS = [
  { k: "name", label: "Item", required: true }, { k: "requiredQuantity", type: "number", min: "1", label: "Quantity needed", required: true },
  { k: "estimated", type: "number", step: "0.01", min: "0", label: "Estimated cost (€)" }, { k: "deadline", type: "date", label: "Needed by" }, { k: "notes", type: "textarea", label: "Notes" },
];

function Items({ eventId, admin }) {
  const q = useGet(`/api/v1/admin/events/${eventId}/procurement-items`);
  const [m, setM] = useState(null);
  const send = useSend("POST", { message: "Saved", onDone: () => setM(null) });
  const put = useSend("PUT", { message: "Saved", onDone: () => setM(null) });
  const del = useSend("DELETE", { message: "Claim removed" });
  return (
    <>
      {admin && <div className="mb-4"><Button onClick={() => setM({ t: "item" })}>Add item</Button></div>}
      <Load q={q}>{(list) => list.length === 0 ? <Empty>No items yet.</Empty> : (
        <div className="space-y-4">{list.map((it) => {
          const left = it.requiredQuantity - it.claimedQuantity;
          return (
            <Card key={it.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="text-xl">{it.name}</h2><p className="text-sm text-ink-soft">{it.claimedQuantity} of {it.requiredQuantity} claimed{it.estimatedCostCents != null && ` · about ${money(it.estimatedCostCents)}`}{it.deadline && ` · by ${fmtDate(it.deadline, { dateStyle: "medium" })}`}</p></div>
                <div className="flex gap-2">{left > 0 && <Button size="sm" onClick={() => setM({ t: "claim", it, left })}>Claim</Button>}{admin && <Button size="sm" variant="outline" onClick={() => setM({ t: "item", it })}>Edit</Button>}</div>
              </div>
              {it.notes && <p className="mt-2 whitespace-pre-line">{it.notes}</p>}
              {(it.claims || []).length > 0 && (
                <ul className="mt-3 divide-y divide-line border-t border-line">{it.claims.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>{c.userName}{c.mine && " (you)"} · {c.quantity} pcs {c.expense && <> · <Badge status={c.expense.status} /> {money(c.expense.amountCents)}</>}</span>
                    {c.mine && <span className="flex gap-2">
                      {(!c.expense || c.expense.status === "REJECTED") && <Button size="sm" variant="outline" onClick={() => setM({ t: "expense", c })}>Submit expense</Button>}
                      {!c.expense && <Button size="sm" variant="outline" onClick={() => del.mutate({ path: `/api/v1/admin/procurement-claims/${c.id}` })}>Remove claim</Button>}
                    </span>}
                    {c.expense?.status === "REJECTED" && c.mine && <span className="w-full text-sm text-kumkum">Rejected: {c.expense.reason}</span>}
                  </li>))}</ul>
              )}
            </Card>);
        })}</div>
      )}</Load>
      <ErrorNote error={del.error} />
      {m?.t === "item" && (
        <FormModal title={m.it ? "Edit item" : "Add item"} fields={ITEM_FIELDS} onClose={() => setM(null)} pending={send.isPending || put.isPending} error={send.error || put.error}
          initial={m.it ? { ...m.it, estimated: centsToEuros(m.it.estimatedCostCents) } : {}}
          onSubmit={(v) => { const { estimated, ...r } = v; const body = { ...r, requiredQuantity: Number(r.requiredQuantity), deadline: r.deadline || null, estimatedCostCents: estimated === "" ? null : eurosToCents(estimated) };
            m.it ? put.mutate({ path: `/api/v1/admin/procurement-items/${m.it.id}`, body }) : send.mutate({ path: `/api/v1/admin/events/${eventId}/procurement-items`, body }); }} />
      )}
      {m?.t === "claim" && (
        <FormModal title={`Claim: ${m.it.name}`} submitText="Claim" fields={[{ k: "quantity", type: "number", min: "1", label: `How many? (${m.left} still needed)`, def: m.left, required: true }]} onClose={() => setM(null)} pending={send.isPending} error={send.error}
          onSubmit={(v) => send.mutate({ path: `/api/v1/admin/procurement-items/${m.it.id}/claims`, body: { quantity: Math.min(Number(v.quantity), m.left) } })} />
      )}
      {m?.t === "expense" && <ExpenseModal claim={m.c} eventId={eventId} onClose={() => setM(null)} />}
    </>
  );
}

function Expenses({ eventId }) {
  const q = useGet(`/api/v1/admin/events/${eventId}/expenses`);
  const [rej, setRej] = useState(null);
  const d = useSend("POST", { message: "Saved", onDone: () => setRej(null) });
  return (
    <Load q={q}>{(l) => l.length === 0 ? <Empty>No expenses submitted.</Empty> : (
      <div className="card overflow-x-auto p-0"><table className="tbl"><thead><tr><th>Item</th><th>By</th><th>Amount</th><th>Receipt</th><th>Status</th><th /></tr></thead>
        <tbody>{l.map((x) => (
          <tr key={x.id}><td>{x.itemName}</td><td>{x.claimant}</td><td>{money(x.amountCents)}</td><td>{x.receiptUrl ? <a href={x.receiptUrl} target="_blank" rel="noopener noreferrer">View</a> : "–"}</td><td><Badge status={x.status} /></td>
            <td>{x.status === "SUBMITTED" && <span className="flex gap-2"><Button size="sm" onClick={() => d.mutate({ path: `/api/v1/admin/expenses/${x.id}/decision`, body: { decision: "APPROVE" } })}>Approve</Button><Button size="sm" variant="outline" onClick={() => setRej(x)}>Reject</Button></span>}</td></tr>))}</tbody></table>
        {rej && <FormModal title="Reject expense" submitText="Reject" fields={[{ k: "reason", type: "textarea", label: "Reason", required: true, hint: "The claimant is emailed this reason." }]} onClose={() => setRej(null)} pending={d.isPending} error={d.error}
          onSubmit={(v) => d.mutate({ path: `/api/v1/admin/expenses/${rej.id}/decision`, body: { decision: "REJECT", reason: v.reason } })} />}
      </div>
    )}</Load>
  );
}

function Reimbursements({ eventId }) {
  const q = useGet(`/api/v1/admin/events/${eventId}/reimbursements`);
  const pay = useSend("POST", { message: "Marked as reimbursed" });
  return (
    <Load q={q}>{(l) => l.length === 0 ? <Empty>Nothing to reimburse.</Empty> : (
      <div className="space-y-4">{l.map((p) => (
        <Card key={p.userId}>
          <div className="mb-2 flex items-center justify-between"><h2 className="text-xl">{p.name}</h2><b>{money(p.totalCents)} owed</b></div>
          {p.expenses.map((x) => (
            <p key={x.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-2">{x.itemName} · {money(x.amountCents)}
              {x.status === "REIMBURSED" ? <Badge status="REIMBURSED" /> : <Button size="sm" onClick={() => pay.mutate({ path: `/api/v1/admin/expenses/${x.id}/reimburse` })}>Mark reimbursed</Button>}</p>))}
        </Card>))}<ErrorNote error={pay.error} /></div>
    )}</Load>
  );
}

export default function Procurement() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const admin = hasDept(user, eventId, "LOGISTICS", "ADMIN");
  const [tab, setTab] = useState("items");
  const tabs = [["items", "Items"], ...(admin ? [["exp", "Expenses to review"]] : []), ...(isEA(user, eventId) ? [["pay", "Reimbursements"]] : [])];
  return (
    <>
      <PageTitle title="Procurement" sub="What the event needs, who is buying it, and what to reimburse." />
      {tabs.length > 1 && <Tabs tabs={tabs} value={tab} onChange={setTab} />}
      {tab === "items" && <Items eventId={eventId} admin={admin} />}
      {tab === "exp" && <Expenses eventId={eventId} />}
      {tab === "pay" && <Reimbursements eventId={eventId} />}
    </>
  );
}
