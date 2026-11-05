import type { ApiFailure, ApiSuccess } from "@/types";

function isApiFailure(value: unknown): value is ApiFailure {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

function isApiSuccess<T>(value: unknown): value is ApiSuccess<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    value.data !== undefined
  );
}

function getResponseErrorMessage(response: unknown, status: number): string {
  return isApiFailure(response) ? response.error : `HTTP ${status}`;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
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
  if (!res.ok) throw new Error(getResponseErrorMessage(json, res.status));
  if (isApiSuccess<T>(json)) return json.data;
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