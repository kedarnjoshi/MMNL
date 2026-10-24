import { api, ApiError } from "./api.js";

// 1) ask backend for a presigned URL, 2) PUT the file straight to storage, 3) caller sends storageKey to the API.
export async function uploadFile({ eventId, purpose, file, onProgress }) {
  const p = await api(`/api/v1/events/${eventId}/uploads/presign`, {
    method: "POST",
    body: { purpose, filename: file.name, mime: file.type, sizeBytes: file.size },
  });
  await new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("PUT", p.uploadUrl);
    Object.entries(p.headers || {}).forEach(([k, v]) => x.setRequestHeader(k, v));
    if (!p.headers?.["Content-Type"] && file.type) x.setRequestHeader("Content-Type", file.type);
    x.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    x.onload = () => (x.status < 300 ? resolve() : reject(new ApiError(422, "The upload to storage failed. Try again; if it keeps failing, contact the website owner.", true)));
    x.onerror = () => reject(new ApiError(422, "The upload to storage failed. Check your connection and try again.", true));
    x.send(file);
  });
  return p.storageKey;
}
