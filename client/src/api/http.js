const API_URL = import.meta.env.VITE_API_URL || "/api";

function authHeaders(extra = {}) {
  const token = localStorage.getItem("examflow_token");
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra };
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers
    }
  });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || "Request failed.");
  return body;
}

export async function apiFile(path) {
  const response = await fetch(`${API_URL}${path}`, { headers: authHeaders() });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error?.message || "File request failed.");
  }
  return { blob: await response.blob(), disposition: response.headers.get("content-disposition") || "" };
}

export async function downloadApiFile(path, fallbackName) {
  const { blob, disposition } = await apiFile(path);
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const name = match?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function openApiHtml(path) {
  const { blob } = await apiFile(path);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
