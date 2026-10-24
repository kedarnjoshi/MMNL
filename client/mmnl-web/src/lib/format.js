const TZ = "Europe/Amsterdam";
export const fmtDate = (iso, o = { dateStyle: "full" }) => (iso ? new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...o }).format(new Date(iso)) : "");
export const fmtDateTime = (iso) => fmtDate(iso, { dateStyle: "medium", timeStyle: "short" });
export const money = (c, cur = "EUR") => (c == null ? "–" : new Intl.NumberFormat("en-NL", { style: "currency", currency: cur }).format(c / 100));
export const label = (s) => (s ? String(s).toLowerCase().replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) : "");
export const eurosToCents = (v) => Math.round(parseFloat(String(v).replace(",", ".")) * 100);
export const centsToEuros = (c) => (c == null ? "" : (c / 100).toFixed(2));
export const isPast = (iso) => !!iso && new Date(iso) < new Date();

// <input type="datetime-local"> values are Amsterdam wall-clock time; the API speaks ISO instants.
export function toInput(iso) {
  if (!iso) return "";
  const p = Object.fromEntries(new Intl.DateTimeFormat("sv-SE", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
export function fromInput(v) {
  if (!v) return null;
  const asUtc = new Date(v + ":00Z");
  const off = new Date(toInput(asUtc.toISOString()) + ":00Z") - asUtc;
  return new Date(asUtc.getTime() - off).toISOString();
}
