import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowRight, Bell, Trash2 } from "lucide-react";
import { apiFetch } from "../lib/apiFetch";
import { useAuth } from "../context/AuthContext";
import { useAccountSheet } from "../context/AccountSheetContext";

type PriceAlert = {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  current_price: string;
  target_price: string;
  created_at: string;
  triggered_at: string | null;
};

export function PriceAlertsPage() {
  const [, navigate]    = useLocation();
  const { user }        = useAuth();
  const { openSheet }   = useAccountSheet();
  const qc              = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery<PriceAlert[]>({
    queryKey: ["price-alerts"],
    queryFn:  () => apiFetch("/api/v1/price-alerts").then(r => r.json()),
    enabled:  !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/v1/price-alerts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["price-alerts"] });
      toast("تم إلغاء التنبيه", { icon: "🔕" });
    },
  });

  return (
    <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: "var(--nav-h)" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, borderBottom: "1px solid var(--border)", background: "var(--bg-card)", padding: "16px 16px 14px", display: "flex", alignItems: "center", gap: 12 }} dir="rtl">
        <button onClick={() => navigate("/account")} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, border: "none", background: "var(--gold-light)", cursor: "pointer" }} aria-label="رجوع">
          <ArrowRight size={16} style={{ color: "var(--text-brand)" }} />
        </button>
        <h1 style={{ fontFamily: "var(--font-main)", fontSize: 17, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>تنبيهات الأسعار</h1>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-3 pt-4">

        {/* Not logged in */}
        {!user && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Bell size={28} style={{ color: "var(--text-brand)" }} />
            </div>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>سجّل دخولك أولاً</p>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>لعرض وإدارة تنبيهات الأسعار الخاصة بك</p>
            <button onClick={() => openSheet()}
              style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: "var(--text-brand)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              تسجيل الدخول
            </button>
          </div>
        )}

        {/* Loading */}
        {user && isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 80, borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {user && !isLoading && alerts.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Bell size={28} style={{ color: "var(--text-brand)" }} />
            </div>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>لا توجد تنبيهات بعد</p>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
              افتح أي منتج واضغط "نبّهني عند انخفاض السعر"
            </p>
            <button onClick={() => navigate("/")}
              style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: "var(--text-brand)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              تصفّح المنتجات
            </button>
          </div>
        )}

        {/* Alerts list */}
        {user && !isLoading && alerts.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 24 }}>
            <p dir="rtl" style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
              {alerts.length} {alerts.length === 1 ? "تنبيه مفعّل" : "تنبيهات مفعّلة"}
            </p>
            {alerts.map(alert => {
              const savings = Number(alert.current_price) - Number(alert.target_price);
              const pct     = Math.round((savings / Number(alert.current_price)) * 100);
              return (
                <div key={alert.id} dir="rtl" style={{
                  display: "flex", alignItems: "center", gap: 12,
                  borderRadius: 16, padding: "12px 14px",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                }}>
                  {/* Image */}
                  <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "var(--card-img-bg)" }}>
                    {alert.product_image ? (
                      <img src={alert.product_image} alt={alert.product_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Bell size={22} style={{ color: "var(--text-muted)" }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {alert.product_name}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <span style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "var(--text-muted)", textDecoration: "line-through" }}>
                        {Number(alert.current_price).toLocaleString("ar-SA")} ر.س
                      </span>
                      <span style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-brand)" }}>
                        {Number(alert.target_price).toLocaleString("ar-SA")} ر.س
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 6, background: "#dcfce7", color: "#16a34a" }}>
                        -{pct}%
                      </span>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteMutation.mutate(alert.id)}
                    disabled={deleteMutation.isPending}
                    style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    aria-label="حذف التنبيه">
                    <Trash2 size={14} style={{ color: "#F87171" }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
