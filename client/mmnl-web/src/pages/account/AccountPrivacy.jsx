import { useState } from "react";
import { Link } from "react-router-dom";
import { useSend } from "../../lib/hooks.js";
import { Button, Card, ErrorNote, Field, Input, Modal } from "../../ui/index.jsx";

export default function AccountPrivacy() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const del = useSend("DELETE", { onDone: () => window.location.assign("/") });
  return (
    <div className="max-w-2xl space-y-5">
      <Card>
        <h2 className="mb-1 text-xl">Download my data</h2>
        <p className="mb-3 text-ink-soft">Get a file with the personal data we hold about you: tickets, registrations, feedback and claims.</p>
        <a href="/api/v1/me/data-export" download className="btn btn-outline">Download my data</a>
      </Card>
      <Card>
        <h2 className="mb-1 text-xl">Delete my account</h2>
        <p className="mb-3 text-ink-soft">This removes your personal details and signs you out. It can't be undone. Read how we handle data in the <Link to="/privacy">privacy page</Link>.</p>
        <Button variant="danger" onClick={() => setOpen(true)}>Delete my account</Button>
      </Card>
      {open && (
        <Modal title="Delete your account?" onClose={() => setOpen(false)}>
          <p className="mb-3">Type <b>DELETE</b> to confirm.</p>
          <Field label="Confirmation"><Input value={text} onChange={(e) => setText(e.target.value)} /></Field>
          <div className="mt-3"><ErrorNote error={del.error} /></div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="danger" disabled={text !== "DELETE"} loading={del.isPending} onClick={() => del.mutate({ path: "/api/v1/me" })}>Delete account</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
