import { Link } from "react-router-dom";
import { useGet } from "../../lib/hooks.js";
import { Load } from "../../ui/index.jsx";
import { DateBlock, EventCard, TicketButton } from "../../components/EventParts.jsx";
import { fmtDate } from "../../lib/format.js";
import { ORG_NAME } from "../../config.js";

export default function Home() {
  const q = useGet("/api/v1/events?scope=upcoming");
  return (
    <Load q={q}>{(events) => {
      const [next, ...rest] = events;
      return (
        <>
          <section className="bg-ink text-white">
            <div className="mx-auto grid max-w-6xl items-end gap-8 px-4 py-14 md:grid-cols-[1fr_auto]">
              {next ? (
                <>
                  <div>
                    <h1 className="text-4xl leading-tight md:text-6xl">{next.title}</h1>
                    <p className="mt-4 text-lg text-white/80">{fmtDate(next.startsAt)} · {next.venue}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <TicketButton event={next} />
                      <Link to={`/events/${next.id}`} className="btn btn-outline border-white/40 text-white hover:bg-white/10">Event details</Link>
                    </div>
                  </div>
                  <DateBlock iso={next.startsAt} />
                </>
              ) : (
                <div>
                  <h1 className="text-4xl md:text-6xl">{ORG_NAME}</h1>
                  <p className="mt-4 text-lg text-white/80">No events are on sale right now. Check back soon.</p>
                  <Link to="/events" className="btn btn-primary mt-6">See past events</Link>
                </div>
              )}
            </div>
          </section>
          <div className="mx-auto max-w-6xl px-4 py-10">
            {rest.length > 0 && (
              <>
                <h2 className="mb-4 text-2xl">More upcoming events</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rest.map((e) => <EventCard key={e.id} event={e} />)}</div>
              </>
            )}
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <Link to="/events" className="card text-ink no-underline hover:border-saffron"><h3 className="mb-1 text-xl">Find an event</h3><p className="text-ink-soft">Dates, venues and tickets for every MMNL event.</p></Link>
              <Link to="/account/tickets" className="card text-ink no-underline hover:border-saffron"><h3 className="mb-1 text-xl">See my tickets</h3><p className="text-ink-soft">Sign in with the Google account you bought with.</p></Link>
              <Link to="/account/performances" className="card text-ink no-underline hover:border-saffron"><h3 className="mb-1 text-xl">Perform on stage</h3><p className="text-ink-soft">Register your dance, music or drama act.</p></Link>
            </div>
          </div>
        </>
      );
    }}</Load>
  );
}
