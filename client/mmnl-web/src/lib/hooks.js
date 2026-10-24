import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api.js";
import { useToast } from "../ui/index.jsx";

export const useGet = (path, opts = {}) => useQuery({ queryKey: [path], queryFn: () => api(path), enabled: !!path, ...opts });

// send.mutate({ path, body }). Refreshes all cached data afterwards (datasets here are small).
export function useSend(method = "POST", { message, onDone } = {}) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ path, body }) => api(path, { method, body }),
    onSuccess: (d, v) => { qc.invalidateQueries(); if (message) toast(message); onDone?.(d, v); },
  });
}
