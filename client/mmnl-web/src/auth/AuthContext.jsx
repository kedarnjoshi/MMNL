import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, csrfHeaders } from "../lib/api.js";
import { reportFatal } from "../lib/errors.js";
import { LOGIN_URL, LOGOUT_URL } from "../config.js";

const Ctx = createContext({ user: undefined });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still checking, null = signed out
  useEffect(() => {
    api("/api/me")
      .then((u) => setUser(u && { roles: [], isSuperAdmin: false, ...u }))
      .catch((e) => { if (e.status !== 401) reportFatal(e); setUser(null); });
  }, []);
  const signOut = async () => {
    try { await fetch(LOGOUT_URL, { method: "POST", credentials: "same-origin", headers: csrfHeaders() }); } catch { /* ignore */ }
    window.location.assign("/");
  };
  return <Ctx.Provider value={{ user, signOut }}>{children}</Ctx.Provider>;
}

const remember = () => { try { sessionStorage.setItem("returnTo", location.pathname + location.search); } catch { /* ignore */ } };

export function SignInLink({ className = "btn btn-primary", children = "Sign in with Google" }) {
  return <a href={LOGIN_URL} onClick={remember} className={className}>{children}</a>;
}

// After Google redirects back to "/", send the person to where they were heading.
export function ReturnTo() {
  const { user } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!user) return;
    try {
      const r = sessionStorage.getItem("returnTo");
      if (r) { sessionStorage.removeItem("returnTo"); nav(r, { replace: true }); }
    } catch { /* ignore */ }
  }, [user, nav]);
  return null;
}
