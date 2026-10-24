import { useAuth } from "../../auth/AuthContext.jsx";
import { useGet } from "../../lib/hooks.js";
import { Badge, Button, Empty, Load } from "../../ui/index.jsx";
import { fmtDateTime } from "../../lib/format.js";
import { downloadIcs } from "../../lib/ics.js";

export default function Tickets() {
  const { user } = useAuth();
  const q = useGet("/api/v1/me/tickets");
  return (
    <Load q={q}>{(tickets) => tickets.length === 0 ? (
      <Empty>
        <p className="mb-1 font-semibold text-ink">No tickets found for {user.email}.</p>
        <p>Tickets are matched by email address. If you bought with a different email, sign in with that Google account instead.</p>
      </Empty>
    ) : (
      <div className="grid gap-5 md:grid-cols-2">
        {tickets.map((t) => (
          <article key={t.id} className="card flex gap-4">
            <div className="shrink-0">
              {t.qrUrl ? <img src={t.qrUrl} alt={`QR code for ticket ${t.barcode || t.id}`} className="h-32 w-32" />
                : <div className="grid h-32 w-32 place-items-center rounded bg-mist p-2 text-center text-xs break-all">{t.barcode || t.id}</div>}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl">{t.eventTitle}</h2>
              <p className="text-ink-soft">{fmtDateTime(t.startsAt)}</p>
              <p className="text-ink-soft">{t.venue}</p>
              <p className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-semibold">{t.ticketType}</span><Badge status={t.status} />
                {t.isComplimentary && <Badge status="COMP">Complimentary</Badge>}
              </p>
              {t.attendeeName && <p className="text-sm text-ink-soft">{t.attendeeName}</p>}
              <Button variant="outline" size="sm" className="mt-3" onClick={() => downloadIcs({ id: t.id, title: t.eventTitle, venue: t.venue, startsAt: t.startsAt, endsAt: t.endsAt })}>Add to calendar</Button>
            </div>
          </article>
        ))}
      </div>
    )}</Load>
  );
}
