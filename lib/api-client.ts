type ApiRes<T> = { data: T } | { error: string };

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const isFormData = opts?.body instanceof FormData;
  const res = await fetch(url, {
    ...opts,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...opts?.headers,
    },
  });
  const json: ApiRes<T> = await res.json();
  if (!res.ok) throw new Error((json as any).error || `HTTP ${res.status}`);
  return 'data' in json && json.data !== undefined ? json.data : (json as unknown as T);
}

export const api = {
  get: <T,>(url: string) => request<T>(url),
  post: <T,>(url: string, body?: any) =>
    request<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T,>(url: string, body?: any) =>
    request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T,>(url: string, body?: any) =>
    request<T>(url, { method: 'DELETE', body: JSON.stringify(body) }),
};