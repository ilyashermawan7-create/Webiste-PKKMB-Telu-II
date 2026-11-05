"use client";

export class ClientApiError extends Error {
  constructor(public status: number, message: string, public errors?: Record<string, string[]>) {
    super(message);
  }
}

/**
 * Pemanggil API dari komponen client. Semua request lewat BFF `/api/proxy/*`
 * sehingga token tetap di cookie httpOnly dan tidak terekspos ke JavaScript.
 */
export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(`/api/proxy${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...rest.headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
  }
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new ClientApiError(res.status, body?.message ?? "Terjadi kesalahan. Coba lagi.", body?.errors);
  }
  return body as T;
}
