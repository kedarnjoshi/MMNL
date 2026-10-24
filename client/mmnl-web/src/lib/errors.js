import { useSyncExternalStore } from "react";

// A tiny store holding the "backend is broken" error that replaces the whole UI with the error page.
let fatal = null;
const subs = new Set();
export const reportFatal = (e) => { fatal = e; subs.forEach((f) => f()); };
export const clearFatal = () => { fatal = null; subs.forEach((f) => f()); };
export const useFatal = () =>
  useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => fatal);
