import { Link, useParams } from "react-router-dom";
import { useGet } from "../../lib/hooks.js";
import { Load } from "../../ui/index.jsx";
import { DateBlock, TicketButton } from "../../components/EventParts.jsx";
import { fmtDate, fmtDateTime, isPast, label } from "../../lib/format.js";

export default function EventDetail() {
  const { eventId } = useParams();
  const q = useGet(`/api/v1/events/${eventId}`);
  return (
    <Load q={q}>{(e) => {
      const regOpen = e.registrationDeadline ? !isPast(e.registrationDeadline) : !!e.registrationOpen;
      const tiers = [...new Set((e.sponsors || []).map((s) => s.tier))];
      return (
        <>
          {e.bannerUrl ? <img src={e.bannerUrl} alt="" className="h-56 w-full object-cover md:h-72" /> : <div className="toran" />}
          <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
              <div>
                <h1 className="text-4xl">{e.title}</h1>
                <p className="mt-2 text-lg text-ink-soft">{fmtDate(e.startsAt)}</p>
                <p className="text-ink-soft">{fmtDateTime(e.startsAt)} – {fmtDateTime(e.endsAt)}</p>
                <p className="text-ink-soft">{e.venue}</p>
              </div>
              <DateBlock iso={e.startsAt} />
            </div>
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <TicketButton event={e} />
              {!e.refundable && <p className="text-sm text-ink-soft">Tickets are non-refundable.</p>}
            </div>
            {e.description && <p className="mb-10 max-w-prose whitespace-pre-line">{e.description}</p>}
            {regOpen && !isPast(e.endsAt || e.startsAt) && (
              <div className="card mb-10 bg-haldi">
                <h2 className="mb-1 text-2xl">Want to perform?</h2>
                <p className="mb-3">Register your act{e.registrationDeadline ? ` by ${fmtDate(e.registrationDeadline)}` : ""}. You'll need to sign in with Google.</p>
                <Link to={`/account/performances/new?eventId=${e.id}`} className="btn btn-dark">Register a performance</Link>
              </div>
            )}
            {tiers.length > 0 && (
              <section>
                <h2 className="mb-4 text-2xl">Our sponsors</h2>
                {tiers.map((t) => (
                  <div key={t} className="mb-5">
                    <h3 className="mb-2 text-lg text-ink-soft">{label(t)}</h3>
                    <div className="flex flex-wrap gap-3">
                      {e.sponsors.filter((s) => s.tier === t).map((s) => (
                        <span key={s.id} className="card flex items-center gap-3 py-3">
                          {s.logoUrl && <img src={s.logoUrl} alt="" className="h-8" />}{s.company}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>
        </>
      );
    }}</Load>
  );
}
