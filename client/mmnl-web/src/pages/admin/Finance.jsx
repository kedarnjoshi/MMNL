import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useGet } from "../../lib/hooks.js";
import { financeLevel } from "../../lib/perm.js";
import { Load, PageTitle, Select, Stat } from "../../ui/index.jsx";
import { label, money } from "../../lib/format.js";

export default function Finance() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const whole = financeLevel(user, eventId) === "WHOLE_EVENT";
  const [scope, setScope] = useState(whole ? "event" : "department");
  const q = useGet(`/api/v1/admin/events/${eventId}/finance?scope=${scope}`);
  return (
    <>
      <PageTitle title="Finance" sub="Income and approved expenses. Read-only.">
        {whole && <div className="w-48"><Select aria-label="Scope" value={scope} onChange={(e) => setScope(e.target.value)}><option value="event">Whole event</option><option value="department">My department</option></Select></div>}
        <a className="btn btn-outline" href={`/api/v1/admin/events/${eventId}/finance/export?scope=${scope}`}>Export CSV</a>
      </PageTitle>
      <Load q={q}>{(f) => (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {f.ticketRevenueCents != null && <Stat label="Ticket revenue" value={money(f.ticketRevenueCents)} />}
            {f.sponsorIncomeCents != null && <Stat label="Sponsor income" value={money(f.sponsorIncomeCents)} />}
            <Stat label="Approved expenses" value={money(f.approvedExpensesCents)} />
            {f.netCents != null && <Stat label="Net" value={money(f.netCents)} />}
          </div>
          {(f.byDepartment || []).length > 0 && (
            <div className="card overflow-x-auto p-0"><table className="tbl"><thead><tr><th>Department</th><th>Approved expenses</th><th>Pending claims</th></tr></thead>
              <tbody>{f.byDepartment.map((d) => <tr key={d.department}><td>{label(d.department)}</td><td>{money(d.expensesCents)}</td><td>{money(d.pendingCents)}</td></tr>)}</tbody></table></div>
          )}
        </div>
      )}</Load>
    </>
  );
}
