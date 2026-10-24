// Mirrors the draft permission matrix in the README. The backend is the real authority; this only decides what to show.
const L = { MEMBER: 1, ADMIN: 2 };
const F = { NONE: 0, OWN_DEPARTMENT: 1, WHOLE_EVENT: 2 };
export const isSA = (u) => !!u?.isSuperAdmin;
export const rolesFor = (u, e) => (u?.roles || []).filter((r) => String(r.eventId) === String(e));
export const isEA = (u, e) => isSA(u) || rolesFor(u, e).some((r) => !r.department);
export const hasDept = (u, e, d, min = "MEMBER") => isEA(u, e) || rolesFor(u, e).some((r) => r.department === d && L[r.level] >= L[min]);
export const financeLevel = (u, e) => {
  if (isEA(u, e)) return "WHOLE_EVENT";
  return rolesFor(u, e).reduce((m, r) => (F[r.financeAccess] > F[m] ? r.financeAccess : m), "NONE");
};
export const hasAnyRole = (u) => isSA(u) || (u?.roles || []).length > 0;
const any = (u, e) => isEA(u, e) || rolesFor(u, e).length > 0;

export const MODULES = [
  { id: "overview", path: "", label: "Overview", test: any },
  { id: "ticketing", path: "ticketing", label: "Ticketing", test: isEA },
  { id: "cultural", path: "cultural", label: "Cultural", test: (u, e) => hasDept(u, e, "CULTURAL") },
  { id: "sponsorship", path: "sponsorship", label: "Sponsorship", test: (u, e) => hasDept(u, e, "SPONSORSHIP") },
  { id: "procurement", path: "procurement", label: "Procurement", test: (u, e) => hasDept(u, e, "LOGISTICS") },
  { id: "campaigns", path: "campaigns", label: "Promotion", test: (u, e) => hasDept(u, e, "PROMOTION") },
  { id: "tasks", path: "tasks", label: "Tasks", test: (u, e) => hasDept(u, e, "PROMOTION") || hasDept(u, e, "DECORATION") },
  { id: "assets", path: "assets", label: "Assets", test: any },
  { id: "finance", path: "finance", label: "Finance", test: (u, e) => financeLevel(u, e) !== "NONE" },
  { id: "surveys", path: "surveys", label: "Surveys", test: isEA },
  { id: "team", path: "team", label: "Team", test: isEA },
  { id: "settings", path: "settings", label: "Event settings", test: isEA },
  { id: "audit", path: "audit", label: "Audit log", test: isEA },
];
