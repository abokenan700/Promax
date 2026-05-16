import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

const TOKEN_KEY   = "nakhba_token";
const CART_KEY    = "nakhba_cart";
const COUPON_KEY  = "nakhba_coupon";
const REMEMBER_KEY = "nakhba_remember";
export const RETURN_TO_KEY = "nakhba_return_to";

export interface AuthUser {
  id:      number;
  name:    string;
  email:   string;
  avatar?: string | null;
}

interface AuthState {
  user:        AuthUser | null;
  loading:     boolean;
  login:       (email: string, password: string) => Promise<void>;
  register:    (name: string, email: string, password: string) => Promise<void>;
  logout:      () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient           = useQueryClient();

  /* ── Initial session restore ── */
  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) { setLoading(false); return; }

    fetch("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(r => {
        if (r.status === 401) { localStorage.removeItem(TOKEN_KEY); return null; }
        return r.ok ? (r.json() as Promise<AuthUser>) : null;
      })
      .then(u => { if (!controller.signal.aborted) setUser(u); })
      .catch(err => {
        if (err instanceof Error && err.name === "AbortError") return;
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, []);

  /* ── Listen for 401 events dispatched by apiFetch ── */
  useEffect(() => {
    function handle() {
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      queryClient.clear();
    }
    window.addEventListener("auth:expired", handle);
    return () => window.removeEventListener("auth:expired", handle);
  }, [queryClient]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json() as { token?: string; user?: AuthUser; error?: string };
    if (!r.ok) throw new Error(data.error ?? "خطأ في تسجيل الدخول");
    if (!data.token || !data.user) throw new Error("استجابة غير متوقعة من الخادم");
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const r = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await r.json() as { token?: string; user?: AuthUser; error?: string };
    if (!r.ok) throw new Error(data.error ?? "خطأ في إنشاء الحساب");
    if (!data.token || !data.user) throw new Error("استجابة غير متوقعة من الخادم");
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const r = await fetch("/api/v1/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const u = await r.json() as AuthUser; setUser(u); }
    } catch { /* silent */ }
  }, []);

  /* ── Logout: clear ALL local state including remember flag ── */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(COUPON_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    try { sessionStorage.removeItem(RETURN_TO_KEY); } catch { }
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
