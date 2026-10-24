import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { label } from "../lib/format.js";

export const cx = (...a) => a.filter(Boolean).join(" ");

export function Button({ variant = "primary", size, loading, className, children, ...p }) {
  return (
    <button type="button" {...p} disabled={p.disabled || loading}
      className={cx("btn", `btn-${variant}`, size === "sm" && "btn-sm", className)}>
      {loading ? "Working…" : children}
    </button>
  );
}

export const Loading = () => <div role="status" className="py-10 text-center text-ink-soft">Loading…</div>;

export function ErrorNote({ error }) {
  if (!error) return null;
  return <p role="alert" className="rounded-md border border-kumkum/40 bg-kumkum/5 text-kumkum px-3 py-2 text-sm">{error.message || "Something went wrong."}</p>;
}

// Renders loading / inline (non-fatal) error / data. Fatal backend errors are handled by the global error page.
export function Load({ q, children }) {
  if (q.isLoading) return <Loading />;
  if (q.error) return q.error.fatal ? <Loading /> : <ErrorNote error={q.error} />;
  return children(q.data);
}

export const Empty = ({ children }) => <div className="card text-center text-ink-soft py-10">{children}</div>;

const TONES = {
  green: ["ISSUED", "APPROVED", "AUDIO_APPROVED", "PAID", "ACTIVE", "PUBLISHED", "DONE", "OPEN", "REIMBURSED", "LIVE", "COMPLETE"],
  amber: ["REGISTERED", "PENDING", "UPLOADED", "SUBMITTED", "COMMITTED", "IN_PROGRESS", "SCHEDULED", "DRAFT", "PROSPECT"],
  red: ["REJECTED", "CANCELLED", "CHANGES_REQUESTED", "REVOKED", "WITHDRAWN", "VOID", "INCOMPLETE"],
  blue: ["CHECKED_IN"],
};
const TONE_CLASS = { green: "bg-tulsi/10 text-tulsi", amber: "bg-saffron/20 text-saffron-deep", red: "bg-kumkum/10 text-kumkum", blue: "bg-indigo/10 text-indigo", slate: "bg-ink/10 text-ink-soft" };
export function Badge({ status, children }) {
  const tone = Object.keys(TONES).find((t) => TONES[t].includes(status)) || "slate";
  return <span className={cx("inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap", TONE_CLASS[tone])}>{children || label(status)}</span>;
}

export const Card = ({ className, ...p }) => <div className={cx("card", className)} {...p} />;

export function Field({ label: text, hint, children, className }) {
  return (
    <label className={cx("block", className)}>
      <span className="label">{text}</span>
      {children}
      {hint && <span className="block text-sm text-ink-soft mt-1">{hint}</span>}
    </label>
  );
}
export const Input = (p) => <input className="input" {...p} />;
export const Textarea = (p) => <textarea className="input min-h-24" {...p} />;
export const Select = ({ children, ...p }) => <select className="input" {...p}>{children}</select>;

export function Modal({ title, onClose, children, wide }) {
  const r = useRef(null);
  useEffect(() => { if (r.current && !r.current.open) r.current.showModal(); }, []);
  return (
    <dialog ref={r} onClose={onClose} onClick={(e) => e.target === r.current && onClose()}
      className={cx("m-auto rounded-lg p-0 backdrop:bg-ink/50 w-[calc(100%-2rem)] max-h-[90vh]", wide ? "max-w-3xl" : "max-w-lg")}>
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-2xl">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="px-2 text-2xl leading-none cursor-pointer">×</button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map(([id, text]) => (
        <button key={id} role="tab" aria-selected={value === id} onClick={() => onChange(id)}
          className={cx("px-4 py-2 -mb-px border-b-2 font-semibold whitespace-nowrap cursor-pointer", value === id ? "border-saffron text-ink" : "border-transparent text-ink-soft hover:text-ink")}>
          {text}
        </button>
      ))}
    </div>
  );
}

export function PageTitle({ title, sub, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl">{title}</h1>{sub && <p className="text-ink-soft">{sub}</p>}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export const Stat = ({ label: l, value, hint }) => (
  <div className="card"><div className="text-sm text-ink-soft">{l}</div><div className="font-display text-3xl">{value ?? "–"}</div>{hint && <div className="text-sm text-ink-soft">{hint}</div>}</div>
);

export const Progress = ({ value, max }) => (
  <div className="h-2 w-full rounded-full bg-ink/10" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
    <div className="h-2 rounded-full bg-saffron" style={{ width: `${max ? Math.min(100, (value / max) * 100) : 0}%` }} />
  </div>
);

export function Pager({ page, total, size = 25, onPage }) {
  const pages = Math.max(1, Math.ceil((total || 0) / size));
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-ink-soft">{total ?? 0} total</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <span>Page {page} of {pages}</span>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

export function RatingInput({ name, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} of 5`} onClick={() => onChange(n)}
          className={cx("h-10 w-10 rounded-md border font-semibold cursor-pointer", value >= n ? "bg-saffron border-saffron text-ink" : "bg-white border-line")}>{n}</button>
      ))}
    </div>
  );
}

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState("");
  const show = useCallback((m) => { setMsg(m); setTimeout(() => setMsg(""), 3500); }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-0 right-0 z-50 flex justify-center">
        {msg && <div className="rounded-md bg-ink px-4 py-2 text-white shadow-lg">{msg}</div>}
      </div>
    </ToastCtx.Provider>
  );
}

// Generic "fill in a few fields" dialog used by most admin screens.
// field: { k, label, type?, options?, required?, hint?, def?, step? }  (options: strings or {value,label})
export function FormModal({ title, fields, initial = {}, onSubmit, pending, error, onClose, submitText = "Save", wide }) {
  const [v, setV] = useState(() => Object.fromEntries(fields.map((f) => [f.k, initial[f.k] ?? f.def ?? (f.type === "checkbox" ? false : "")])));
  const set = (k) => (e) => setV({ ...v, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  return (
    <Modal title={title} onClose={onClose} wide={wide}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(v); }} className="space-y-4">
        {fields.map((f) => f.type === "checkbox" ? (
          <label key={f.k} className="flex items-center gap-2"><input type="checkbox" checked={!!v[f.k]} onChange={set(f.k)} /> {f.label}</label>
        ) : (
          <Field key={f.k} label={f.label || label(f.k)} hint={f.hint}>
            {f.type === "select" ? (
              <Select required={f.required} value={v[f.k]} onChange={set(f.k)}>
                {f.options.map((o) => typeof o === "string" ? <option key={o} value={o}>{label(o)}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            ) : f.type === "textarea" ? <Textarea required={f.required} value={v[f.k]} onChange={set(f.k)} />
              : <Input type={f.type || "text"} step={f.step} min={f.min} required={f.required} value={v[f.k]} onChange={set(f.k)} />}
          </Field>
        ))}
        <ErrorNote error={error} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={pending}>{submitText}</Button>
        </div>
      </form>
    </Modal>
  );
}
