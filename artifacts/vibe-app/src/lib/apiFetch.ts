import { getDeviceId } from "./deviceId";

const TOKEN_KEY = "nakhba_token";

export function getAuthToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function getDeviceHeaders(opts?: { json?: boolean }): HeadersInit {
  const headers: Record<string, string> = { "x-device-id": getDeviceId() };
  if (opts?.json) headers["Content-Type"] = "application/json";
  return headers;
}

export function getAuthHeaders(opts?: { json?: boolean }): HeadersInit {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (opts?.json) headers["Content-Type"] = "application/json";
  return headers;
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit & { auth?: boolean; json?: boolean }
): Promise<T> {
  const { auth = false, json = false, ...rest } = options ?? {};
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api/v1${path}`, {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string> ?? {}) },
  });

  if (res.status === 401) {
    try { localStorage.removeItem(TOKEN_KEY); } catch { }
    /* T5: Dispatch event so AuthContext can clear user state */
    window.dispatchEvent(new Event("auth:expired"));
    throw new Error("الجلسة منتهية — يرجى تسجيل الدخول مجدداً");
  }

  if (!res.ok) {
    let msg = "حدث خطأ في الخادم";
    try {
      const body = await res.json() as { error?: string };
      if (body.error) msg = body.error;
    } catch { }
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
