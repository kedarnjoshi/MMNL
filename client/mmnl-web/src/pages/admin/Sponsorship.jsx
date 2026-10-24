import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useGet, useSend } from "../../lib/hooks.js";
import { hasDept } from "../../lib/perm.js";
import { Badge, Button, Card, Empty, FormModal, Load, PageTitle, Progress } from "../../ui/index.jsx";
import { SPONSOR_TIERS } from "../../config.js";
import { centsToEuros, eurosToCents, fmtDate, label, money } from "../../lib/format.js";

const FIELDS = [
  { k: "company", label: "Company", required: true },
  { k: "tier", type: "select", options: SPONSOR_TIERS, label: "Tier" },
  { k: "status", type: "select", options: ["PROSPECT", "COMMITTED", "PAID"], label: "Status" },
  { k: "contactName", label: "Contact name" },
  { k: "contactEmail", type: "email", label: "Contact email" },
  { k: "pledged", type: "number", step: "0.01", min: "0", label: "Pledged amount (€)" },
  { k: "isPublic", type: "checkbox", label: "Show on the public event page" },
];

export default function Sponsorship() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const admin = hasDept(user, eventId, "SPONSORSHIP", "ADMIN");
  const q = useGet(`/api/v1/admin/events/${eventId}/sponsors`);
  const [modal, setModal] = useState(null); // {type, sponsor}
  const [openId, setOpenId] = useState(null);
  const save = useSend("POST", { message: "Saved", onDone: () => setModal(null) });
  const put = useSend("PUT", { message: "Saved", onDone: () => setModal(null) });
  const voidPass = useSend("POST", { message: "Pass voided" });
  const close = () => setModal(null);
  const m = modal;

  return (
    <>
      <PageTitle title="Sponsorship" sub="Sponsors, payments received and complimentary passes.">
        <Button onClick={() => setModal({ type: "sponsor" })}>Add sponsor</Button>
      </PageTitle>
      <Load q={q}>{(list) => list.length === 0 ? <Empty>No sponsors yet.</Empty> : (
        <div className="space-y-4">{list.map((s) => (
          <Card key={s.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-xl">{s.company}</h2><p className="text-sm text-ink-soft">{s.contactName} {s.contactEmail && `· ${s.contactEmail}`}</p></div>
              <div className="flex gap-2"><Badge status="DRAFT">{label(s.tier)}</Badge><Badge status={s.status} /></div>
            </div>
            <div className="my-3"><div className="mb-1 flex justify-between text-sm"><span>Received {money(s.paidCents)}</span><span>Pledged {money(s.pledgedCents)}</span></div><Progress value={s.paidCents || 0} max={s.pledgedCents || 0} /></div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setModal({ type: "sponsor", s })}>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => setOpenId(openId === s.id ? null : s.id)} aria-expanded={openId === s.id}>Payments and passes</Button>
            </div>
            {openId === s.id && (
              <div className="mt-4 grid gap-6 border-t border-line pt-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between"><h3 className="text-lg">Payments</h3>{admin && <Button size="sm" onClick={() => setModal({ type: "payment", s })}>Record payment</Button>}</div>
                  {(s.payments || []).length === 0 ? <p className="text-ink-soft">None recorded.</p> : s.payments.map((p) => <p key={p.id}>{money(p.amountCents)} <span className="text-sm text-ink-soft">on {fmtDate(p.receivedOn, { dateStyle: "medium" })} {p.note && `· ${p.note}`}</span></p>)}
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between"><h3 className="text-lg">Complimentary passes</h3>{admin && <Button size="sm" onClick={() => setModal({ type: "pass", s })}>Issue pass</Button>}</div>
                  <p className="mb-2 text-sm text-ink-soft">{s.compIssued ?? 0} issued of {s.compAllotted ?? 0} allotted</p>
                  {(s.compPasses || []).map((c) => (
                    <p key={c.id} className="flex flex-wrap items-center gap-2">{c.recipientName} <span className="text-sm text-ink-soft">{c.ticketType}</span> <Badge status={c.status} />
                      {admin && c.status !== "VOID" && <Button size="sm" variant="outline" onClick={() => voidPass.mutate({ path: `/api/v1/admin/comp-passes/${c.id}/void` })}>Void</Button>}</p>))}
                </div>
              </div>
            )}
          </Card>))}</div>
      )}</Load>
      {m?.type === "sponsor" && (
        <FormModal title={m.s ? "Edit sponsor" : "Add sponsor"} fields={FIELDS} pending={save.isPending || put.isPending} error={save.error || put.error} onClose={close}
          initial={m.s ? { ...m.s, pledged: centsToEuros(m.s.pledgedCents) } : { tier: "SILVER", status: "PROSPECT" }}
          onSubmit={(v) => { const { pledged, ...rest } = v; const body = { ...rest, pledgedCents: pledged === "" ? 0 : eurosToCents(pledged) };
            m.s ? put.mutate({ path: `/api/v1/admin/sponsors/${m.s.id}`, body }) : save.mutate({ path: `/api/v1/admin/events/${eventId}/sponsors`, body }); }} />
      )}
      {m?.type === "payment" && (
        <FormModal title={`Record payment from ${m.s.company}`} submitText="Record payment" pending={save.isPending} error={save.error} onClose={close}
          fields={[{ k: "amount", type: "number", step: "0.01", min: "0", label: "Amount (€)", required: true }, { k: "receivedOn", type: "date", label: "Received on", required: true }, { k: "note", label: "Note" }]}
          onSubmit={(v) => save.mutate({ path: `/api/v1/admin/sponsors/${m.s.id}/payments`, body: { amountCents: eurosToCents(v.amount), receivedOn: v.receivedOn, note: v.note } })} />
      )}
      {m?.type === "pass" && (
        <FormModal title={`Issue pass for ${m.s.company}`} submitText="Issue pass" pending={save.isPending} error={save.error} onClose={close}
          fields={[{ k: "recipientName", label: "Recipient name", required: true }, { k: "recipientEmail", type: "email", label: "Recipient email", required: true, hint: "The pass is emailed to this address." }, { k: "ticketType", label: "Ticket type", required: true }]}
          onSubmit={(v) => save.mutate({ path: `/api/v1/admin/sponsors/${m.s.id}/comp-passes`, body: v })} />
      )}
    </>
  );
}
