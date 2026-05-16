import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Package, Truck, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAccountSheet } from "../context/AccountSheetContext";
import { apiFetch } from "../lib/apiFetch";

type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  id: number; product_id: number; name: string; brand: string;
  price: string; qty: number; color: string; image: string;
}

interface Order {
  id: number; user_id: number; status: OrderStatus;
  payment_method: string;
  address_name: string | null; address_city: string | null;
  subtotal: string; shipping: string; total: string;
  created_at: string;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  processing: { label: "قيد المعالجة",    color: "var(--text-brand)", bg: "var(--gold-pale)", icon: <Package size={13} /> },
  shipped:    { label: "في الطريق إليك",  color: "#1565C0", bg: "#E3F2FD", icon: <Truck size={13} /> },
  delivered:  { label: "تم التسليم",      color: "#5A8A4A", bg: "#E8F5E9", icon: <CheckCircle size={13} /> },
  cancelled:  { label: "مُلغى",           color: "#C62828", bg: "#FFEBEE", icon: <XCircle size={13} /> },
};

const TIMELINE: Record<OrderStatus, string[]> = {
  processing: ["✓ تم تأكيد الطلب", "✓ قيد التجهيز", "○ شُحن", "○ تم التسليم"],
  shipped:    ["✓ تم تأكيد الطلب", "✓ قيد التجهيز", "✓ شُحن", "○ تم التسليم"],
  delivered:  ["✓ تم تأكيد الطلب", "✓ قيد التجهيز", "✓ شُحن", "✓ تم التسليم"],
  cancelled:  ["✓ تم تأكيد الطلب", "✗ مُلغى"],
};

function formatOrderId(id: number) {
  return `NKH-${String(id).padStart(6, "0")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" });
}

function estimateDelivery(order: Order): string {
  if (order.status === "delivered") return "تم التسليم";
  const d = new Date(order.created_at);
  d.setDate(d.getDate() + 3);
  return `${d.toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" })}`;
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.processing;
  const timeline = TIMELINE[order.status] ?? TIMELINE.processing;

  return (
    <div style={{ borderRadius: 18, background: "var(--bg-card)", border: "1px solid var(--border-warm)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "14px 16px" }} dir="rtl">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 800, color: "var(--text-brand)" }}>{formatOrderId(order.id)}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{formatDate(order.created_at)}</p>
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700 }}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", background: "var(--card-img-bg)", flexShrink: 0, border: "1px solid var(--border-warm)" }}>
              <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
            </div>
          ))}
          {order.items.length > 3 && (
            <div style={{ width: 52, height: 52, borderRadius: 10, background: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-brand)" }}>+{order.items.length - 3}</span>
            </div>
          )}
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 800, color: "var(--text-price)" }}>
            {Number(order.total).toLocaleString("ar-SA")} ر.س
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 10, background: order.status === "delivered" ? "#E8F5E9" : "var(--gold-pale)" }} dir="rtl">
          <Truck size={13} style={{ color: order.status === "delivered" ? "#5A8A4A" : "var(--text-brand)" }} />
          <span style={{ fontSize: 12, color: order.status === "delivered" ? "#5A8A4A" : "var(--text-brand)", fontWeight: 600 }}>
            {estimateDelivery(order)}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 16px 14px", borderTop: "1px solid var(--border)" }} dir="rtl">
          <p style={{ fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", padding: "12px 0 10px" }}>مسار الطلب</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {timeline.map((step, i) => {
              const done = step.startsWith("✓");
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: done ? (order.status === "cancelled" && i === 1 ? "#FFEBEE" : "var(--gold)") : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 9, color: done ? "#fff" : "var(--text-muted)" }}>{step.slice(0, 1)}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-main)", fontSize: 12.5, color: done ? "var(--text-primary)" : "var(--text-muted)", fontWeight: done ? 600 : 400 }}>
                    {step.slice(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", borderTop: "1px solid var(--border)" }}>
        <button onClick={() => setExpanded((v) => !v)}
          style={{ flex: 1, padding: "11px 0", background: "transparent", border: "none", borderInlineStart: "1px solid var(--border)", cursor: "pointer", fontFamily: "var(--font-main)", fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} dir="rtl">
          {expanded ? "إخفاء التفاصيل" : "تفاصيل الطلب"}
        </button>
        {order.status === "delivered" && (
          <button style={{ flex: 1, padding: "11px 0", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-main)", fontSize: 12.5, fontWeight: 700, color: "var(--text-brand)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} dir="rtl">
            <RotateCcw size={13} />إعادة الطلب
          </button>
        )}
      </div>
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div style={{ borderRadius: 18, background: "var(--bg-card)", border: "1px solid var(--border-warm)", padding: "16px", overflow: "hidden" }}>
      <div className="animate-pulse" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ height: 14, width: "40%", borderRadius: 6, background: "#EDE8E2" }} />
          <div style={{ height: 22, width: "28%", borderRadius: 20, background: "#EDE8E2" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3].map((i) => <div key={i} style={{ width: 52, height: 52, borderRadius: 10, background: "#EDE8E2" }} />)}
        </div>
        <div style={{ height: 36, borderRadius: 10, background: "#EDE8E2" }} />
      </div>
    </div>
  );
}

export function OrdersPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { openSheet } = useAccountSheet();

  const { data: orders = [], isLoading, isError, refetch } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: () => apiFetch<Order[]>("/orders", { auth: true }),
    enabled: !!user,
  });

  return (
    <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-page)", paddingBottom: "var(--nav-h)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg-card)", borderBottom: "1px solid var(--border-warm)", flexShrink: 0 }} dir="rtl">
        <button onClick={() => navigate("/account")}
          style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--border-warm)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowRight size={17} style={{ color: "var(--text-primary)" }} />
        </button>
        <h1 style={{ fontFamily: "var(--font-main)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>طلباتي</h1>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {!user ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 14, padding: "0 24px" }} dir="rtl">
            <Package size={48} style={{ color: "#D4CFC9" }} strokeWidth={1.2} />
            <p style={{ fontFamily: "var(--font-main)", fontSize: 16, fontWeight: 600, color: "var(--text-primary)", textAlign: "center" }}>سجّل دخولك لعرض طلباتك</p>
            <button onClick={() => openSheet()}
              style={{ padding: "12px 28px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              تسجيل الدخول
            </button>
          </div>
        ) : isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2].map((i) => <OrderSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }} dir="rtl">
            <Package size={40} style={{ color: "#D4CFC9" }} strokeWidth={1.2} />
            <p style={{ fontFamily: "var(--font-main)", fontSize: 14, color: "var(--text-muted)" }}>تعذّر تحميل الطلبات</p>
            <button onClick={() => void refetch()}
              style={{ padding: "9px 22px", borderRadius: 12, border: "1px solid var(--border-warm)", background: "transparent", color: "var(--text-secondary)", fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              إعادة المحاولة
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 14, padding: "0 24px" }} dir="rtl">
            <Package size={48} style={{ color: "#D4CFC9" }} strokeWidth={1.2} />
            <p style={{ fontFamily: "var(--font-main)", fontSize: 16, fontWeight: 600, color: "var(--text-primary)", textAlign: "center" }}>لا توجد طلبات بعد</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>ابدأ التسوق وستظهر طلباتك هنا</p>
            <button onClick={() => navigate("/")}
              style={{ padding: "12px 28px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,var(--gold),var(--gold-accent))", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              تسوّق الآن
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>

    </div>
  );
}
