import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth, SignInLink } from "../auth/AuthContext.jsx";
import { hasAnyRole } from "../lib/perm.js";
import { CONTACT_EMAIL, ORG_NAME, ORG_SHORT } from "../config.js";

export default function PublicLayout() {
  const { user, signOut } = useAuth();
  const link = ({ isActive }) => `no-underline py-1 border-b-2 ${isActive ? "border-saffron text-white" : "border-transparent text-white/80 hover:text-white"}`;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-3 text-white no-underline">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-saffron font-display text-xl text-ink">म</span>
            <span className="font-display text-xl leading-tight">{ORG_SHORT}<span className="-mt-1 block font-sans text-xs text-white/70">{ORG_NAME}</span></span>
          </Link>
          <nav className="flex flex-1 items-center gap-5">
            <NavLink to="/events" className={link}>Events</NavLink>
            {user && <NavLink to="/account" className={link}>My account</NavLink>}
            {user && hasAnyRole(user) && <NavLink to="/admin" className={link}>Admin portal</NavLink>}
          </nav>
          {user === undefined ? null : user ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-white/80">Hello, {user.firstName}</span>
              <button onClick={signOut} className="btn btn-outline btn-sm border-white/40 text-white hover:bg-white/10">Sign out</button>
            </div>
          ) : <SignInLink className="btn btn-primary btn-sm" />}
        </div>
        <div className="toran" />
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="mt-16 bg-ink text-sm text-white/70">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-4 py-6">
          <span>© {new Date().getFullYear()} {ORG_NAME}</span>
          <span className="flex gap-4">
            <Link to="/privacy" className="text-white/80">Privacy</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-white/80">Contact</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
