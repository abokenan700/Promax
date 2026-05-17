import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui";
import { useGetProducts } from "@workspace/api-client-react";

const CHECKOUT_COMPLETE_KEY = "nakhba_checkout_complete";

function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${5 + (i * 5.5) % 90}%`,
      delay: `${(i * 0.12).toFixed(2)}s`,
      color: i % 4 === 0 ? "#FFD700" : i % 4 === 1 ? "#C0A882" : i % 4 === 2 ? "#5A8A4A" : "#B8922A",
      size: 6 + (i % 3) * 3,
    }))
  );
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p) => (
        <div key={p.id}
          style={{
            position: "absolute", top: "-10px", left: p.left,
            width: p.size, height: p.size, borderRadius: p.id % 3 === 0 ? "50%" : 2,
            background: p.color, animationDelay: p.delay,
          }}
          className="confetti-fall"
        />
      ))}
    </div>
  );
}

const PAY_METHOD_LABELS: Record<string, string> = {
  cod:   "الدفع عند الاستلام",
  card:  "بطاقة ائتمانية",
  apple: "Apple Pay / مدى",
};

export function OrderSuccessPage() {
  const [, navigate] = useLocation();
  const { clearCart } = useCart();
  const [show, setShow] = useState(false);
  const [validAccess, setValidAccess] = useState(false);

  const paymentLabel = PAY_METHOD_LABELS[sessionStorage.getItem("nakhba_payment_method") ?? "cod"] ?? "الدفع عند الاستلام";
  const orderNum = sessionStorage.getItem("nakhba_last_order_id") ?? `NKH-${Date.now().toString().slice(-6)}`;

  const delivery = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" });
  })();

  useEffect(() => {
    const flag = sessionStorage.getItem(CHECKOUT_COMPLETE_KEY);
    if (!flag) {
      navigate("/");
      return;
    }
    sessionStorage.removeItem(CHECKOUT_COMPLETE_KEY);
    clearCart();
    setValidAccess(true);
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, [clearCart, navigate]);

  if (!validAccess) return null;

  return (
    <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-page)", paddingBottom: "var(--nav-h)", position: "relative" }}>
      <Confetti />

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 24px", gap: 0 }} dir="rtl">

        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: "linear-gradient(135deg,var(--gold),var(--gold-accent))",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24,
          transform: show ? "scale(1)" : "scale(0)",
          opacity: show ? 1 : 0,
          transition: "transform var(--duration-slow) var(--ease-spring), opacity var(--duration-slow) var(--ease-standard)",
          boxShadow: "var(--shadow-success)",
        }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M8 22L18 32L36 12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: 50, strokeDashoffset: show ? 0 : 50, transition: "stroke-dashoffset 0.5s ease 0.3s" }} />
          </svg>
        </div>

        <h1 style={{ fontFamily: "var(--font-main)", fontSize: 22, fontWeight: 800, color: "var(--text-primary)", textAlign: "center", marginBottom: 8, opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)", transition: "opacity var(--duration-slow) var(--ease-standard) 0.4s, transform var(--duration-slow) var(--ease-standard) 0.4s" }}>
          تم تأكيد طلبك! 🎉
        </h1>
        <p style={{ fontFamily: "var(--font-main)", fontSize: 14, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6, opacity: show ? 1 : 0, transition: "opacity var(--duration-slow) var(--ease-standard) 0.5s" }}>
          شكراً لك على ثقتك بنخبة. طلبك في طريقه إليك.
        </p>

        <div style={{
          marginTop: 28, width: "100%", borderRadius: 18, background: "var(--bg-card)",
          border: "1px solid var(--border-warm)", overflow: "hidden",
          opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(16px)",
          transition: "opacity var(--duration-slow) var(--ease-standard) 0.55s, transform var(--duration-slow) var(--ease-standard) 0.55s",
        }}>
          <div style={{ padding: "14px 16px", background: "var(--gold-pale)", borderBottom: "1px solid rgba(192,168,130,0.25)" }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>رقم الطلب</p>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 16, fontWeight: 800, color: "var(--text-brand)", letterSpacing: 1 }}>{orderNum}</p>
          </div>
          {[
            { icon: "📦", label: "الحالة", value: "قيد المعالجة" },
            { icon: "🚚", label: "التوصيل المتوقع", value: delivery },
            { icon: "💳", label: "طريقة الدفع", value: paymentLabel },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid var(--border)" }} dir="rtl">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontFamily: "var(--font-main)", fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
              </div>
              <span style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: 24, opacity: show ? 1 : 0, transition: "opacity var(--duration-slow) var(--ease-standard) 0.7s" }}>
          <Button variant="primary" size="lg" onClick={() => navigate("/orders")} className="w-full rounded-[14px]">
            تتبع الطلب
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/")} className="w-full rounded-[14px]">
            مواصلة التسوق
          </Button>
        </div>

        <PostOrderUpsell show={show} navigate={navigate} />
      </div>
    </div>
  );
}

/* ── Post-order upsell ── */
function PostOrderUpsell({ show, navigate }: { show: boolean; navigate: (to: string) => void }) {
  const { data: products = [] } = useGetProducts();
  const picks = products.slice(0, 6);
  if (!picks.length) return null;

  return (
    <div style={{ width: "100%", marginTop: 32, opacity: show ? 1 : 0, transition: "opacity var(--duration-slow) var(--ease-standard) 0.9s" }}>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 22 }}>
        <p style={{ fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, textAlign: "center" }}>
          قد يعجبك أيضاً ✨
        </p>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }} dir="rtl">
          {picks.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              style={{
                flexShrink: 0, width: 130, borderRadius: 14, overflow: "hidden",
                background: "var(--card-bg)", border: "1px solid var(--card-border)",
                textAlign: "start", cursor: "pointer", padding: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ width: "100%", aspectRatio: "1/1", background: "var(--card-img-bg)", position: "relative" }}>
                <img src={p.image} alt={p.name} loading="lazy"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: 10 }}
                  onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                />
              </div>
              <div style={{ padding: "8px 10px 10px" }} dir="rtl">
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-brand)", marginBottom: 3 }}>{p.brand}</p>
                <p className="line-clamp-2" style={{ fontFamily: "var(--font-main)", fontSize: 11.5, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 5 }}>{p.name}</p>
                <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 800, color: "var(--text-price)" }}>
                  {p.price.toLocaleString("ar-SA")} <span style={{ fontSize: 9.5, fontWeight: 400, color: "var(--text-secondary)" }}>ر.س</span>
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
