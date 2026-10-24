import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const TABS = [["tickets", "Tickets"], ["performances", "Performances"], ["feedback", "Feedback"], ["privacy", "Privacy & data"]];
export default function AccountLayout() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl">My account</h1>
      <p className="mb-6 text-ink-soft">Signed in as {user.email}</p>
      <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map(([to, text]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `-mb-px border-b-2 px-4 py-2 font-semibold no-underline whitespace-nowrap ${isActive ? "border-saffron text-ink" : "border-transparent text-ink-soft"}`}>{text}</NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
