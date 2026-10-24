import { Link } from "react-router-dom";
import { fmtDate, isPast } from "../lib/format.js";

export function DateBlock({ iso }) {
  const d = new Date(iso);
  const tz = { timeZone: "Europe/Amsterdam" };
  return (
    <div className="inline-flex flex-col items-center rounded-lg bg-saffron px-6 py-3 text-ink">
      <span className="font-display text-5xl leading-none">{new Intl.DateTimeFormat("en-GB", { ...tz, day: "numeric" }).format(d)}</span>
      <span className="font-semibold">{new Intl.DateTimeFormat("en-GB", { ...tz, month: "short", year: "numeric" }).format(d)}</span>
    </div>
  );
}

export function TicketButton({ event, className = "btn btn-primary" }) {
  if (!event.ticketTailorUrl || isPast(event.endsAt || event.startsAt)) return null;
  return <a href={event.ticketTailorUrl} target="_blank" rel="noopener noreferrer" className={className}>Get tickets</a>;
}

export function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`} className="card block overflow-hidden p-0 text-ink no-underline hover:border-saffron">
      {event.bannerUrl ? <img src={event.bannerUrl} alt="" className="h-40 w-full object-cover" /> : <div className="toran h-4" />}
      <div className="p-5">
        <h3 className="text-xl mb-1">{event.title}</h3>
        <p className="text-ink-soft">{fmtDate(event.startsAt)}</p>
        <p className="text-ink-soft">{event.venue}</p>
      </div>
    </Link>
  );
}
