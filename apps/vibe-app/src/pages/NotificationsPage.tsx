import { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Bell, Tag, Truck, TrendingDown, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/apiFetch";
import { useAccountSheet } from "../context/AccountSheetContext";

type NotifType = "promo" | "order" | "price" | "review";

interface Notif {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  action: string | null;
  read: string;
  created_at: string;
}

const TYPE_CONFIG: Record<NotifType, { icon: React.ReactNode; color: string; bg: string }> = {
  promo:  { icon: <Tag size={16} />,          color: "#8B6310", bg: "#FDF6EC" },
  order:  { icon: <Truck size={16} />,         color: "#1565C0", bg: "#E3F2FD" },
  price:  { icon: <TrendingDown size={16} />,  color: "#5A8A4A", bg: "#E8F5E9" },
  review: { icon: <Star size={16} />,          color: "#B8922A", bg: "#FFF8E1" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `منذ ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "أمس";
  return new Date(iso).toLocaleDateString("ar-SA", { day: "numeric", month: "long" });
}

export function NotificationsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { openSheet } = useAccountSheet();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const qc = useQueryClient();

  const { data: notifs = [], isLoading } = useQuery<Notif[]>({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<Notif[]>("/notifications", { auth: true }),
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/notifications/${id}/read`, { method: "PATCH", auth: true }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllRead = useCallback(async () => {
    const unread = notifs.filter((n) => n.read === "false");
    await Promise.all(unread.map((n) => markReadMutation.mutateAsync(n.id)));
  }, [notifs, markReadMutation]);

  const unreadCount = notifs.filter((n) => n.read === "false").length;
  const visible     = filter === "unread" ? notifs.filter((n) => n.read === "false") : notifs;

  return (
    <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-page)", paddingBottom: "var(--nav-h)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg-card)", borderBottom: "1px solid var(--border-warm)", flexShrink: 0 }} dir="rtl">
        <button onClick={() => navigate("/account")}
          style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--border-warm)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowRight size={17} style={{ color: "var(--text-primary)" }} />
        </button>
        <h1 style={{ fontFamily: "var(--font-main)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>الإشعارات</h1>
        {unreadCount > 0 && (
          <button onClick={() => void markAllRead()}
            style={{ fontSize: 12, fontWeight: 600, color: "var(--text-brand)", background: "transparent", border: "none", cursor: "pointer" }}>
            قراءة الكل
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, padding: "10px 16px", background: "var(--bg-card)", borderBottom: "1px solid var(--border-warm)", flexShrink: 0 }} dir="rtl">
        {[
          { key: "all" as const,    label: "الكل" },
          { key: "unread" as const, label: `غير مقروءة (${unreadCount})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "var(--font-main)", fontSize: 12.5, fontWeight: 600, background: filter === key ? "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)" : "var(--bg-page)", color: filter === key ? "#fff" : "var(--text-secondary)", transition: "background 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        {!user ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 14, padding: "0 24px" }} dir="rtl">
            <Bell size={48} style={{ color: "#D4CFC9" }} strokeWidth={1.2} />
            <p style={{ fontFamily: "var(--font-main)", fontSize: 15, color: "var(--text-muted)" }}>سجّل دخولك لعرض الإشعارات</p>
            <button onClick={() => openSheet()}
              style={{ padding: "12px 28px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              تسجيل الدخول
            </button>
          </div>
        ) : isLoading ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse" style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: "#EDE8E2", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ height: 12, width: "60%", borderRadius: 4, background: "#EDE8E2" }} />
                  <div style={{ height: 10, width: "90%", borderRadius: 4, background: "#EDE8E2" }} />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }} dir="rtl">
            <Bell size={48} style={{ color: "#D4CFC9" }} strokeWidth={1.2} />
            <p style={{ fontFamily: "var(--font-main)", fontSize: 15, color: "var(--text-muted)" }}>لا توجد إشعارات</p>
          </div>
        ) : (
          visible.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.promo;
            const isRead = n.read === "true";
            return (
              <button key={n.id}
                onClick={() => { if (!isRead) markReadMutation.mutate(n.id); }}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", width: "100%", background: isRead ? "var(--bg-card)" : "var(--gold-pale)", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", textAlign: "start", transition: "background 0.2s" }}
                dir="rtl">
                <div style={{ width: 42, height: 42, borderRadius: 14, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: isRead ? 600 : 700, color: "var(--text-primary)" }}>{n.title}</p>
                    {!isRead && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 6 }}>{n.body}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{timeAgo(n.created_at)}</span>
                    {n.action && (
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-brand)" }}>{n.action} ←</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

    </div>
  );
}
