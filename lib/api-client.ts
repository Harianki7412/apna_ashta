function getErrorMessage(response: unknown, status: number): string {
  if (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof response.error === "string"
  ) {
    return response.error;
  }
  return `HTTP ${status}`;
}

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const isFormData = opts?.body instanceof FormData;
  const headers = new Headers(opts?.headers);
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...opts,
    headers,
  });
  const json: unknown = await res.json();
  if (!res.ok) throw new Error(getErrorMessage(json, res.status));
  if (
    typeof json === "object" &&
    json !== null &&
    "data" in json &&
    json.data !== undefined
  ) {
    return json.data as T;
  }
  return json as T;
}

export const api = {
  get: <T,>(url: string) => request<T>(url),
  post: <T,>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T,>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T,>(url: string, body?: unknown) =>
    request<T>(url, { method: 'DELETE', body: JSON.stringify(body) }),
};