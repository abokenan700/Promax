import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight, Heart, Share2, ShoppingBag, Truck,
  RotateCcw, Shield, ChevronDown, ChevronUp, Minus, Plus,
  Check, Users, Bell, X, Star, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@workspace/api-client-react";
import { useGetProducts } from "@workspace/api-client-react";
import { API_BASE } from "../lib/apiBase";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/apiFetch";
import { StickyBuyBar } from "../components/StickyBuyBar";
import { Stars } from "../components/Stars";
import { Button } from "../components/ui";
import { ProductColorPicker } from "../components/ProductColorPicker";
import { useAccountSheet } from "../context/AccountSheetContext";

/* ─── Types ───────────────────────────────────────────────────── */
type PriceAlert = { id: number; product_id: number; target_price: string; triggered_at: string | null };
type Review     = { id: number; product_id: number; user_id: number; user_name: string; rating: number; body: string; verified: number; created_at: string | null };

/* ─── PriceAlertSection ───────────────────────────────────────── */
function PriceAlertSection({ product }: { product: Product }) {
  const { user }                                      = useAuth();
  const qc                                            = useQueryClient();
  const { openSheet }                                 = useAccountSheet();
  const [sheetOpen, setSheet]                         = useState(false);
  const [targetPrice, setTargetPrice]                 = useState("");

  const { data: alerts = [] } = useQuery<PriceAlert[]>({
    queryKey: ["price-alerts"],
    queryFn:  () => apiFetch("/price-alerts"),
    enabled:  !!user,
    staleTime: 30_000,
  });

  const myAlert    = alerts.find(a => a.product_id === product.id) ?? null;
  const defaultTarget = Math.floor(product.price * 0.85);
  const saving        = product.price - Number(targetPrice);

  const createMutation = useMutation({
    mutationFn: () => apiFetch("/price-alerts", {
      method: "POST", auth: true, json: true,
      body: JSON.stringify({
        product_id: product.id, product_name: product.name, product_image: product.image,
        current_price: product.price, target_price: Number(targetPrice),
      }),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["price-alerts"] }); qc.invalidateQueries({ queryKey: ["notifications"] }); setSheet(false); toast("تم تفعيل التنبيه 🔔", { description: `سنُخطرك عندما ينخفض السعر إلى ${Number(targetPrice).toLocaleString("ar-SA")} ر.س` }); },
    onError:   (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/price-alerts/product/${product.id}`, { method: "DELETE", auth: true }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["price-alerts"] }); toast("تم إلغاء التنبيه", { icon: "🔕" }); },
  });

  function handleOpen() {
    if (!user) { openSheet(); return; }
    setTargetPrice(String(defaultTarget)); setSheet(true);
  }

  return (
    <>
      <div dir="rtl" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 14, padding: "12px 14px", marginBottom: 14, background: myAlert ? "var(--gold-light)" : "var(--bg-card)", border: `1.5px solid ${myAlert ? "var(--gold)" : "var(--border-warm)"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: myAlert ? "var(--text-brand)" : "var(--gold-light)" }}>
            {myAlert ? <Bell size={17} color="#fff" fill="#fff" /> : <Bell size={17} style={{ color: "var(--text-brand)" }} />}
          </div>
          <div>
            {myAlert ? (
              <><p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-brand)" }}>التنبيه مفعّل</p><p style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>السعر المستهدف: {Number(myAlert.target_price).toLocaleString("ar-SA")} ر.س</p></>
            ) : (
              <><p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>نبّهني عند انخفاض السعر</p><p style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>حدّد سعرك المستهدف ونُرسل إشعاراً</p></>
            )}
          </div>
        </div>
        {myAlert ? (
          <button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#F87171", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} aria-label="إلغاء التنبيه">
            <X size={14} color="#fff" />
          </button>
        ) : (
          <button onClick={handleOpen} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "var(--text-brand)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>فعّل</button>
        )}
      </div>

      {sheetOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} onClick={() => setSheet(false)} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, maxWidth: 430, margin: "0 auto", background: "var(--bg-card)", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 18px" }} />
            <h3 dir="rtl" style={{ fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>تفعيل تنبيه السعر 🔔</h3>
            <p dir="rtl" style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.7 }}>السعر الحالي:&nbsp;<strong style={{ color: "var(--text-brand)" }}>{product.price.toLocaleString("ar-SA")} ر.س</strong></p>
            <label dir="rtl" style={{ display: "block", fontFamily: "var(--font-main)", fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>السعر المستهدف (ر.س)</label>
            <input type="number" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} min={1} max={product.price - 1} dir="rtl"
              style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "1.5px solid var(--border-warm)", background: "var(--bg)", fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
            {targetPrice && Number(targetPrice) > 0 && Number(targetPrice) < product.price && (
              <p dir="rtl" style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "var(--success, #16a34a)", marginTop: 6 }}>ستوفّر {saving.toLocaleString("ar-SA")} ر.س</p>
            )}
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !targetPrice || Number(targetPrice) >= product.price || Number(targetPrice) <= 0}
              style={{ width: "100%", padding: "14px", marginTop: 14, borderRadius: 14, border: "none", background: "var(--text-brand)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: (createMutation.isPending || !targetPrice || Number(targetPrice) >= product.price) ? 0.5 : 1 }}>
              {createMutation.isPending ? "جارٍ الحفظ..." : "احفظ التنبيه"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Accordion ───────────────────────────────────────────────── */
function AccordionRow({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border-warm)" }}>
      <button onClick={() => setOpen((v) => !v)} dir="rtl"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", background: "none", border: "none", cursor: "pointer" }}>
        <span style={{ fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{title}</span>
        {open ? <ChevronUp size={15} style={{ color: "var(--text-brand)" }} /> : <ChevronDown size={15} style={{ color: "var(--text-secondary)" }} />}
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <p dir="rtl" style={{ padding: "0 16px 14px", fontFamily: "var(--font-main)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{body}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── T13: Multi-image Gallery with T1: RTL swipe fix ──────────── */
function ImageGallery({ images, name, badges }: {
  images: string[]; name: string; badges: { isNew: boolean; discount: number };
}) {
  const [active, setActive] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  const [delta, setDelta]   = useState(0);
  const n = images.length;

  function onStart(x: number) { setTouchX(x); setDelta(0); }
  function onMove(x: number) { if (touchX === null) return; setDelta(x - touchX); }
  function onEnd() {
    if (touchX === null) return;
    /* T1: RTL swipe — delta > 0 (swipe right) = next image */
    if (delta > 40  && active < n - 1) setActive((a) => a + 1);
    if (delta < -40 && active > 0)     setActive((a) => a - 1);
    setTouchX(null); setDelta(0);
  }

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "var(--card-img-bg)", overflow: "hidden", userSelect: "none" }}>
      <div
        style={{
          display: "flex", width: `${n * 100}%`, height: "100%",
          transform: `translateX(calc(-${active * 100 / n}% + ${delta}px))`,
          transition: touchX !== null ? "none" : "transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e)  => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
      >
        {images.map((src, i) => (
          <div key={i} style={{ width: `${100 / n}%`, flexShrink: 0, position: "relative" }}>
            <img src={src} alt={`${name} — صورة ${i + 1}`} loading={i === 0 ? "eager" : "lazy"}
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: 28 }}
              onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", top: 14, insetInlineStart: 14, display: "flex", flexDirection: "column", gap: 6 }} dir="rtl">
        {badges.isNew && <span style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-accent))", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>جديد</span>}
        {badges.discount > 0 && <span style={{ background: "var(--discount-bg)", color: "var(--discount-text)", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>خصم {badges.discount}%</span>}
      </div>

      {/* Thumbnail strip — side */}
      {n > 1 && (
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", insetInlineEnd: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {images.map((src, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`صورة ${i + 1}`}
              style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", border: `2px solid ${i === active ? "var(--gold)" : "rgba(255,255,255,0.7)"}`, background: "rgba(255,255,255,0.9)", padding: 3, cursor: "pointer", transition: "border-color 0.2s", flexShrink: 0 }}>
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators */}
      {n > 1 && (
        <div style={{ position: "absolute", bottom: 10, insetInlineStart: 0, insetInlineEnd: 0, display: "flex", justifyContent: "center", gap: 5 }}>
          {images.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`اذهب للصورة ${i + 1}`}
              style={{ width: 18, height: 6, borderRadius: 3, background: i === active ? "var(--gold)" : "rgba(0,0,0,0.2)", transform: `scaleX(${i === active ? 1 : 0.33})`, transformOrigin: "center", transition: "transform 0.25s, background 0.25s", border: "none", cursor: "pointer", padding: 0 }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Delivery pills ──────────────────────────────────────────── */
function DeliveryPills() {
  return (
    <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }} dir="rtl">
      {[
        { icon: <Truck size={12} />, text: "توصيل ٢-٤ أيام" },
        { icon: <RotateCcw size={12} />, text: "إرجاع مجاني ٣٠ يوماً" },
        { icon: <Shield size={12} />, text: "ضمان الأصالة" },
      ].map(({ icon, text }) => (
        <div key={text} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 20, background: "var(--gold-pale)", border: "1px solid rgba(192,168,130,0.3)" }}>
          <span style={{ color: "var(--text-brand)" }}>{icon}</span>
          <span style={{ fontFamily: "var(--font-main)", fontSize: 11, fontWeight: 600, color: "var(--text-brand)" }}>{text}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── T25: BuyersCount — fixed label ─────────────────────────── */
function BuyersCount({ sales }: { sales: number }) {
  if (!sales || sales <= 0) return null;
  const display = sales > 500 ? `${Math.round(sales / 100) * 100}+` : `${sales}`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, background: "#F0F8F0", marginBottom: 18 }} dir="rtl">
      <Users size={14} style={{ color: "#5A8A4A", flexShrink: 0 }} />
      <span style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "#3A7A2A", fontWeight: 600 }}>
        اشتراه أكثر من {display} مشترٍ
      </span>
    </div>
  );
}

/* ─── T21: Real Reviews Section ───────────────────────────────── */
function ReviewsSection({ product }: { product: Product }) {
  const { user }    = useAuth();
  const qc          = useQueryClient();
  const { openSheet }           = useAccountSheet();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating]     = useState(5);
  const [body, setBody]         = useState("");

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["reviews", product.id],
    queryFn:  () => fetch(`${API_BASE}/products/${product.id}/reviews`).then(r => r.json()),
    staleTime: 60_000,
  });

  const submitMutation = useMutation({
    mutationFn: () => apiFetch(`/products/${product.id}/reviews`, {
      method: "POST", auth: true, json: true,
      body: JSON.stringify({ rating, body }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", product.id] });
      setShowForm(false); setBody(""); setRating(5);
      toast.success("شكراً! تم نشر تقييمك");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dist   = [87, 9, 3, 1, 0];
  const total  = reviews.length > 0 ? reviews.length : Math.round(product.sales / 8);

  return (
    <div style={{ padding: "20px 16px 8px" }} dir="rtl">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>التقييمات</h2>
        <button onClick={() => user ? setShowForm(v => !v) : openSheet()}
          style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid var(--gold)", background: showForm ? "var(--gold-pale)" : "transparent", color: "var(--text-brand)", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          {showForm ? "إلغاء" : "اكتب تقييماً"}
        </button>
      </div>

      {/* Write review form */}
      {showForm && (
        <div style={{ padding: 14, borderRadius: 14, background: "var(--gold-pale)", border: "1px solid rgba(192,168,130,0.3)", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, justifyContent: "center" }}>
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                <Star size={24} className={s <= rating ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-300 fill-none"} />
              </button>
            ))}
          </div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="شاركنا تجربتك مع هذا المنتج (10 أحرف على الأقل)..."
            rows={3}
            dir="rtl"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-warm)", background: "var(--bg-card)", fontFamily: "var(--font-main)", fontSize: 13, color: "var(--text-primary)", resize: "none", outline: "none", boxSizing: "border-box" }}
          />
          <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || body.trim().length < 10}
            style={{ width: "100%", marginTop: 10, padding: "12px", borderRadius: 10, border: "none", background: "var(--text-brand)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: (submitMutation.isPending || body.trim().length < 10) ? 0.5 : 1 }}>
            {submitMutation.isPending ? "جارٍ النشر..." : "نشر التقييم"}
          </button>
        </div>
      )}

      {/* Rating summary */}
      <div style={{ display: "flex", gap: 16, padding: 16, background: "var(--gold-pale)", borderRadius: 16, border: "1px solid rgba(192,168,130,0.2)", marginBottom: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 64 }}>
          <span style={{ fontFamily: "var(--font-main)", fontSize: 36, fontWeight: 800, color: "var(--text-brand)", lineHeight: 1 }}>{product.rating}</span>
          <Stars rating={product.rating} size={10} />
          <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>{total.toLocaleString("ar-SA")} تقييم</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          {dist.map((pct, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", minWidth: 18 }}>{5 - i}★</span>
              <div style={{ flex: 1, height: 5, borderRadius: 3, background: "#E8E2D8", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "var(--gold)", borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 10, color: "var(--text-muted)", minWidth: 28 }}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      {isLoading ? (
        <div style={{ padding: "16px 0" }}>
          {[1, 2].map(i => <div key={i} className="animate-pulse" style={{ height: 80, borderRadius: 12, background: "#EDE8E2", marginBottom: 12 }} />)}
        </div>
      ) : reviews.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "16px 0 8px" }}>
          كن أوّل من يكتب تقييماً لهذا المنتج
        </p>
      ) : (
        reviews.map((r, i) => (
          <div key={r.id} style={{ padding: "14px 0", borderBottom: i < reviews.length - 1 ? "1px solid var(--border-warm)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,var(--gold),var(--gold-accent))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{r.user_name[0]}</span>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{r.user_name}</p>
                  {r.verified === 1 && <span style={{ fontSize: 10, color: "#5A8A4A", fontWeight: 600 }}>✓ مشتري موثّق</span>}
                </div>
              </div>
              {r.created_at && (
                <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                  {new Date(r.created_at).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
            </div>
            <div style={{ marginBottom: 6 }}><Stars rating={r.rating} size={12} /></div>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{r.body}</p>
          </div>
        ))
      )}

    </div>
  );
}

/* ─── T22: Size Picker ────────────────────────────────────────── */
function SizePicker({ sizes, selected, onSelect }: { sizes: string[]; selected: string; onSelect: (s: string) => void }) {
  if (!sizes || sizes.length === 0) return null;
  return (
    <div dir="rtl" style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
          المقاس: <span style={{ color: "var(--text-brand)" }}>{selected}</span>
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {sizes.map((s) => (
          <button key={s} onClick={() => onSelect(s)}
            style={{ padding: "8px 18px", borderRadius: 10, border: `2px solid ${selected === s ? "var(--gold)" : "var(--border-warm)"}`, background: selected === s ? "var(--gold-pale)" : "var(--bg-card)", color: selected === s ? "var(--text-brand)" : "var(--text-primary)", fontFamily: "var(--font-main)", fontSize: 13, fontWeight: selected === s ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Related Products ────────────────────────────────────────── */
function RelatedProducts({ currentId }: { currentId: number }) {
  const { data: products = [], isLoading } = useGetProducts();
  const [, navigate] = useLocation();
  const related = useMemo(() => products.filter((p) => p.id !== currentId).slice(0, 8), [products, currentId]);
  if (isLoading) return (
    <div style={{ borderTop: "6px solid var(--border-separator)", padding: "20px 16px 8px" }}>
      <div className="animate-pulse rounded" style={{ height: 18, width: "40%", background: "#EDE8E2", marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 10, overflowX: "hidden" }}>
        {[1, 2, 3].map((i) => <div key={i} className="animate-pulse" style={{ flexShrink: 0, width: 130, height: 190, borderRadius: 14, background: "#EDE8E2" }} />)}
      </div>
    </div>
  );
  if (related.length === 0) return null;
  return (
    <div style={{ borderTop: "6px solid var(--border-separator)" }}>
      <div style={{ padding: "20px 16px 12px" }} dir="rtl">
        <h2 style={{ fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>قد يعجبك أيضاً</h2>
      </div>
      <div className="hide-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", paddingInline: 16, paddingBottom: 16 }} dir="rtl">
        {related.map((p) => (
          <button key={p.id} onClick={() => navigate(`/product/${p.id}`)}
            style={{ flexShrink: 0, width: 130, borderRadius: 14, overflow: "hidden", background: "var(--card-bg)", border: "1px solid var(--card-border)", textAlign: "start", cursor: "pointer", padding: 0, transition: "transform 0.15s ease, box-shadow 0.15s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
            <div style={{ width: "100%", aspectRatio: "1/1", background: "var(--card-img-bg)", position: "relative" }}>
              <img src={p.image} alt={p.name} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: 10 }} onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
            </div>
            <div style={{ padding: "8px 10px 10px" }} dir="rtl">
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-brand)", marginBottom: 3 }}>{p.brand}</p>
              <p className="line-clamp-2" style={{ fontFamily: "var(--font-main)", fontSize: 11.5, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 5 }}>{p.name}</p>
              <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 800, color: "var(--text-price)" }}>{p.price.toLocaleString("ar-SA")} <span style={{ fontSize: 9.5, fontWeight: 400, color: "var(--text-secondary)" }}>ر.س</span></p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── PAGE ────────────────────────────────────────────────────── */
export function ProductDetailPage() {
  const { id }            = useParams<{ id: string }>();
  const [, navigate]      = useLocation();
  const { addToCart }     = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn:  () => fetch(`${API_BASE}/products/${id}`).then(r => { if (!r.ok) throw new Error("404"); return r.json(); }),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize,  setSelectedSize]  = useState<string>("");
  const [added, setAdded]   = useState(false);
  const buyBarRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      if (!selectedColor) setSelectedColor(product.colors?.[0] ?? "");
      if (!selectedSize)  setSelectedSize(product.sizes?.[0] ?? "");
      try {
        const stored = localStorage.getItem("nakhba_recent_viewed");
        const recent: unknown[] = stored ? JSON.parse(stored) as unknown[] : [];
        const filtered = (recent as { id: number }[]).filter(r => r.id !== product.id);
        const entry = { id: product.id, name: product.name, price: product.price, image: product.image, badge: product.discount > 0 ? `-${product.discount}%` : product.is_new ? "جديد" : "", isNew: product.is_new ?? false };
        localStorage.setItem("nakhba_recent_viewed", JSON.stringify([entry, ...filtered].slice(0, 12)));
      } catch { }
    }
  }, [product, selectedColor, selectedSize]);

  const liked  = product ? isWishlisted(product.id) : false;
  const isOOS  = (product?.stock ?? 1) === 0;   /* T3 */

  function handleAddToCart() {
    if (!product || isOOS) return;
    addToCart(product, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!product || isOOS) return;
    addToCart(product, selectedColor);
    navigate("/checkout");
  }

  function handleShare() {
    if (navigator.share && product) {
      navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => toast("تم نسخ الرابط")).catch(() => {});
    }
  }

  /* ── Loading / error states ── */
  if (isLoading) {
    return (
      <div style={{ flex: "1 1 auto", overflowY: "auto", paddingBottom: 90 }}>
        <div className="animate-pulse" style={{ width: "100%", aspectRatio: "1/1", background: "#EDE8E2" }} />
        <div style={{ padding: "18px 16px" }}>
          {[150, 200, 100].map((w, i) => <div key={i} className="animate-pulse rounded" style={{ height: 16, width: w, background: "#EDE8E2", marginBottom: 14 }} />)}
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <AlertTriangle size={40} style={{ color: "var(--text-muted)" }} />
        <p style={{ fontFamily: "var(--font-main)", fontSize: 15, color: "var(--text-muted)" }}>المنتج غير موجود</p>
        <button onClick={() => navigate(-1 as unknown as string)} style={{ padding: "10px 24px", borderRadius: 12, border: "1px solid var(--gold)", background: "transparent", color: "var(--text-brand)", fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          رجوع
        </button>
      </div>
    );
  }

  /* T13: Use product.images if available, else fall back to [product.image] */
  const galleryImages = (product.images?.length ?? 0) > 0 ? product.images : [product.image];

  return (
    <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* Top bar */}
      <div style={{ position: "absolute", top: 0, insetInline: 0, zIndex: 20, padding: "12px 14px", display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1 as unknown as string)} aria-label="رجوع"
          style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.88)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(6px)" }}>
          <ArrowRight size={17} />
        </button>
        <button onClick={handleShare} aria-label="مشاركة"
          style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.88)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(6px)" }}>
          <Share2 size={17} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="hide-scrollbar" style={{ flex: "1 1 auto", overflowY: "auto", paddingBottom: 90 }}>
        <ImageGallery images={galleryImages} name={product.name} badges={{ isNew: product.is_new ?? false, discount: product.discount }} />

        {/* T3: OOS banner */}
        {isOOS && (
          <div dir="rtl" style={{ margin: "0 16px", padding: "10px 14px", borderRadius: 10, background: "#FEF0EE", border: "1px solid #F87171", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} style={{ color: "#E04545", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-main)", fontSize: 13, color: "#C03030", fontWeight: 600 }}>نفذ هذا المنتج من المخزون</span>
          </div>
        )}

        <div style={{ padding: "18px 16px 0" }}>
          {/* Brand + name */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-brand)", marginBottom: 4 }} dir="rtl">{product.brand}</p>
          <h1 style={{ fontFamily: "var(--font-main)", fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 10, lineHeight: 1.35 }} dir="rtl">{product.name}</h1>

          {/* Stars */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }} dir="rtl">
            <Stars rating={product.rating} size={13} />
            <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>({Math.round(product.sales / 8).toLocaleString("ar-SA")} تقييم)</span>
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }} dir="rtl">
            <span style={{ fontFamily: "var(--font-main)", fontSize: 24, fontWeight: 800, color: "var(--text-price)" }}>
              {product.price.toLocaleString("ar-SA")} <span style={{ fontSize: 13, fontWeight: 500 }}>ر.س</span>
            </span>
            {product.discount > 0 && (
              <>
                <span style={{ fontSize: 14, color: "var(--text-muted)", textDecoration: "line-through" }}>{product.original_price.toLocaleString("ar-SA")}</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--discount-bg)", color: "var(--discount-text)" }}>وفّر {product.discount}%</span>
              </>
            )}
          </div>

          {/* T14: Scarcity signal */}
          {!isOOS && product.stock > 0 && product.stock < 5 && (
            <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, background: "#FFF3E0", border: "1px solid #FFB300", marginBottom: 16 }}>
              <AlertTriangle size={14} style={{ color: "#E65100", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "#BF360C", fontWeight: 700 }}>
                تبقّى {product.stock} {product.stock === 1 ? "قطعة" : "قطع"} فقط — اطلب الآن قبل النفاد
              </span>
            </div>
          )}

          {/* T22: Size picker */}
          <SizePicker sizes={product.sizes ?? []} selected={selectedSize} onSelect={setSelectedSize} />

          {/* Color picker */}
          {product.colors && product.colors.length > 0 && (
            <div dir="rtl" style={{ marginBottom: 18 }}>
              <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
                اللون: <span style={{ color: "var(--text-brand)" }}>{selectedColor}</span>
              </p>
              <ProductColorPicker colors={product.colors} selected={selectedColor} onSelect={setSelectedColor} />
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p dir="rtl" style={{ fontFamily: "var(--font-main)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: 18 }}>
              {product.description}
            </p>
          )}

          {/* T25: BuyersCount */}
          <BuyersCount sales={product.sales} />

          {/* Price Alert */}
          <PriceAlertSection product={product} />

          {/* Add to cart buttons */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }} dir="rtl">
            <button onClick={handleAddToCart} disabled={isOOS}
              style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: isOOS ? "var(--border)" : added ? "linear-gradient(135deg,var(--gold),var(--gold-accent))" : "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)", color: isOOS ? "var(--text-muted)" : "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: isOOS ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.3s" }}>
              {isOOS ? "نفذ المخزون" : added ? <><Check size={16} />تمت الإضافة</> : <><ShoppingBag size={16} />أضف للسلة</>}
            </button>
            <button onClick={handleAddToCart} disabled={isOOS}
              style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1.5px solid ${isOOS ? "var(--border)" : "var(--gold)"}`, background: "transparent", color: isOOS ? "var(--text-muted)" : "var(--text-brand)", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: isOOS ? "not-allowed" : "pointer" }}>
              اشتري الآن
            </button>
          </div>

          <DeliveryPills />
        </div>

        {/* Accordions */}
        <div style={{ borderTop: "6px solid var(--border-separator)" }}>
          <AccordionRow title="معلومات المنتج" body={product.description || `${product.brand} — ${product.name}. منتج أصلي 100% من المصدر المعتمد. يتضمن التغليف الأصلي وشهادة الأصالة.`} />
          <AccordionRow title="الشحن والتوصيل" body="التوصيل خلال ٢-٤ أيام عمل داخل المملكة. الشحن مجاني للطلبات فوق ٥٠٠ ر.س. يمكن تتبع طلبك فور شحنه." />
          <AccordionRow title="سياسة الإرجاع" body="الإرجاع مجاني خلال ٣٠ يوماً من تاريخ الاستلام. المنتج يجب أن يكون بحالته الأصلية مع التغليف الكامل وبطاقة العلامة التجارية." />
        </div>

        {/* Reviews */}
        <div style={{ borderTop: "6px solid var(--border-separator)" }}>
          <ReviewsSection product={product} />
        </div>

        {/* Related */}
        <RelatedProducts currentId={product.id} />

        {/* Wishlist FAB */}
        <div ref={buyBarRef} />
      </div>

      {/* Sticky Buy Bar */}
      <StickyBuyBar
        product={product}
        liked={liked}
        added={added}
        isOOS={isOOS}
        onAdd={handleAddToCart}
        onBuy={handleBuyNow}
        onWishlist={() => toggleWishlist(product)}
      />

    </div>
  );
}
