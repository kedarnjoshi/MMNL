// Backend error contract (see API_ENDPOINTS.md): { "message": "...", "safe": true|false }
// `safe: true` means the message may be shown to visitors on the error page.
export class ApiError extends Error {
  constructor(status, message, safe = false, body = null) {
    super(message || DEFAULTS[status] || "Something went wrong.");
    this.status = status; this.safe = safe; this.body = body; this.at = new Date();
  }
  get fatal() { return this.status === 0 || this.status >= 500; }
}
const DEFAULTS = {
  0: "The server could not be reached.",
  400: "Please check the form and try again.", 401: "Please sign in again.",
  403: "You don't have access to this.", 404: "We couldn't find that.",
  409: "That conflicts with existing data.", 422: "Please check the form and try again.",
};

const cookie = (n) => document.cookie.split("; ").find((c) => c.startsWith(n + "="))?.split("=")[1];
export function csrfHeaders() {
  const t = cookie("XSRF-TOKEN");
  return t ? { "X-XSRF-TOKEN": decodeURIComponent(t) } : {};
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") Object.assign(headers, csrfHeaders());
  let res;
  try {
    res = await fetch(path, { method, headers, credentials: "same-origin", redirect: "manual", body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch (err) {
    console.error("[api] fetch failed", method, path, err);
    throw new ApiError(0, "The server could not be reached.", true, { debug: `${method} ${path}: ${err}` });
  }
  // Spring redirects unauthenticated requests to the Google login page; treat that as 401, not a network failure.
  if (res.type === "opaqueredirect") throw new ApiError(401, "Please sign in to see this.", false);
  if (res.status === 204) return null;
  const isJson = (res.headers.get("content-type") || "").includes("json");
  const data = isJson ? await res.json().catch(() => null) : null;
  if (!res.ok) throw new ApiError(res.status, data?.message, data?.safe === true, { ...data, debug: `${method} ${path} → ${res.status}` });
  // A 200 that isn't JSON means the proxy served the SPA instead of the API (backend down/misrouted).
  if (!isJson) throw new ApiError(502, "The server sent an unexpected response.", false, { debug: `${method} ${path} → ${res.status} ${res.headers.get("content-type")} (expected JSON; is the dev proxy set up?)` });
  return data;
}