import { Link, useNavigate } from "react-router-dom";
import { clearFatal } from "../lib/errors.js";
import { CONTACT_EMAIL, ORG_NAME } from "../config.js";
import { fmtDateTime } from "../lib/format.js";

export function ErrorPage({ error }) {
  const nav = useNavigate();
  const unreachable = error.status === 0;
  return (
    <div className="min-h-screen bg-mist">
      <div className="toran" />
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-4xl mb-3">{unreachable ? "We can't reach the server" : "Something went wrong on our side"}</h1>
        <p className="text-ink-soft mb-4">
          {unreachable ? "Check your internet connection and try again." : "Your request didn't go through, and it isn't something you did wrong."}
        </p>
        {error.safe && error.message ? (
          <p className="card mb-4">{error.message}</p>
        ) : (
          <p className="card mb-4">
            Details aren't shown here for security reasons. Please contact the website owner at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Tell them what you were doing and the time below.
          </p>
        )}
        <p className="text-sm text-ink-soft mb-6">
          {error.status ? `Error ${error.status} · ` : ""}{fmtDateTime(error.at)}
        </p>
        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button>
          <button className="btn btn-outline" onClick={() => { clearFatal(); nav("/"); }}>Go to home page</button>
        </div>
        <p className="mt-10 text-sm text-ink-soft">{ORG_NAME}</p>
      </main>
    </div>
  );
}

const Msg = ({ title, children }) => (
  <div className="mx-auto max-w-xl px-4 py-16 text-center">
    <h1 className="text-4xl mb-3">{title}</h1>
    <p className="text-ink-soft mb-6">{children}</p>
    <Link to="/" className="btn btn-primary">Go to home page</Link>
  </div>
);
export const NotFound = () => <Msg title="Page not found">The link may be old or mistyped.</Msg>;
export const Forbidden = () => <Msg title="You don't have access to this page">If you think you should, ask an Event Admin to check your role.</Msg>;
