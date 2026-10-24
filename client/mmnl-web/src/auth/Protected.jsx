import { useParams } from "react-router-dom";
import { useAuth, SignInLink } from "./AuthContext.jsx";
import { Loading } from "../ui/index.jsx";
import { Forbidden } from "../pages/System.jsx";
import { MODULES } from "../lib/perm.js";

export function SignInCard({ text = "Sign in to continue." }) {
  return (
    <div className="mx-auto max-w-md py-16 px-4 text-center">
      <h1 className="text-3xl mb-3">Sign in</h1>
      <p className="text-ink-soft mb-6">{text} We use your Google account, so there is no new password to remember.</p>
      <SignInLink />
    </div>
  );
}

export default function Protected({ children, test }) {
  const { user } = useAuth();
  if (user === undefined) return <Loading />;
  if (user === null) return <SignInCard />;
  if (test && !test(user)) return <Forbidden />;
  return children;
}

export function Module({ id, children }) {
  const { eventId } = useParams();
  const { user } = useAuth();
  const m = MODULES.find((x) => x.id === id);
  return m.test(user, eventId) ? children : <Forbidden />;
}
