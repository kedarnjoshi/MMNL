export function downloadIcs({ id, title, venue, startsAt, endsAt }) {
  const f = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s) => String(s || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const end = endsAt || new Date(new Date(startsAt).getTime() + 3 * 3600e3);
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MMNL//Tickets//EN", "BEGIN:VEVENT",
    `UID:${id}@mmnl`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(startsAt)}`, `DTEND:${f(end)}`,
    `SUMMARY:${esc(title)}`, `LOCATION:${esc(venue)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  a.download = `${title}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}
