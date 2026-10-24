import { useState } from "react";
import { useGet } from "../../lib/hooks.js";
import { Load, Tabs, Empty } from "../../ui/index.jsx";
import { EventCard } from "../../components/EventParts.jsx";

export default function Events() {
  const [scope, setScope] = useState("upcoming");
  const q = useGet(`/api/v1/events?scope=${scope}`);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl">Events</h1>
      <Tabs tabs={[["upcoming", "Upcoming"], ["past", "Past"]]} value={scope} onChange={setScope} />
      <Load q={q}>{(events) => events.length === 0
        ? <Empty>{scope === "upcoming" ? "No upcoming events yet." : "No past events to show."}</Empty>
        : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{events.map((e) => <EventCard key={e.id} event={e} />)}</div>}</Load>
    </div>
  );
}
