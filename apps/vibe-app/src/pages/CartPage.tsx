import { ShoppingBag, Trash2, Plus, Minus, CheckSquare, Square, ArrowRight, Tag, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { SearchBar } from "../components/SearchBar";
import { useCart } from "../context/CartContext";
import { useGetProducts } from "@workspace/api-client-react";
import type { CartItem } from "../context/CartContext";
import { Button } from "../components/ui";
import { calcShipping, FREE_SHIPPING_THRESHOLD } from "../lib/shippingPolicy";

/* ── Free Shipping Bar ──────────────────────────────────────────── */
function FreeShippingBar({ total }: { total: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const pct = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const reached = total >= FREE_SHIPPING_THRESHOLD;

  return (
    <div dir="rtl" style={{ padding: "10px 12px", background: reached ? "#E8F5E9" : "var(--gold-pale)", borderBottom: "1px solid var(--border-warm)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 700, color: reached ? "#5A8A4A" : "var(--text-brand)" }}>
          {reached ? "🎉 تأهّلت للشحن المجاني!" : `أضف ${remaining.toLocaleString("ar-SA")} ر.س للحصول على شحن مجاني 🚚`}
        </span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: reached ? "#C8E6C0" : "rgba(192,168,130,0.25)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: reached ? "linear-gradient(90deg,#5A8A4A,#4A7A3A)" : "linear-gradient(90deg,var(--gold),var(--gold-accent))", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

/* ── Coupon Input ───────────────────────────────────────────────── */
function CouponInput() {
  const { couponCode, applyCoupon, removeCoupon, discountPct } = useCart();
  const [code, setCode]   = useState("");
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState("");

  async function apply() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setBusy(true); setError("");
    try {
      await applyCoupon(trimmed);
      toast.success(`تم تطبيق كوبون خصم ${discountPct || ""}٪ 🎉`);
      setCode("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "كوبون غير صالح";
      setError(msg); toast.error(msg);
    } finally { setBusy(false); }
  }

  function reset() { removeCoupon(); setCode(""); setError(""); toast("تم إلغاء الكوبون"); }

  const applied = !!couponCode;

  return (
    <div dir="rtl" style={{ padding: "10px 12px", background: "var(--bg-card)", borderBottom: "1px solid var(--border-warm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${error ? "#E04545" : applied ? "#5A8A4A" : "var(--border-warm)"}`, background: "var(--bg-page)", transition: "border-color 0.2s" }}>
          <Tag size={14} style={{ color: applied ? "#5A8A4A" : "var(--text-muted)", flexShrink: 0 }} />
          {applied ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "#5A8A4A" }}>{couponCode} — خصم {discountPct}٪ ✓</span>
              <button onClick={reset} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9A9692", padding: 0, display: "flex" }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <input
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && void apply()}
              placeholder="أدخل كود الخصم"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-main)", fontSize: 13, color: "var(--text-primary)", direction: "rtl", letterSpacing: 1 }}
            />
          )}
        </div>
        {!applied && (
          <button onClick={() => void apply()} disabled={busy}
            style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: busy ? 0.7 : 1 }}>
            {busy ? "..." : "تطبيق"}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 11, color: "#E04545", marginTop: 5, paddingInlineStart: 4 }}>{error}</p>}
    </div>
  );
}

/* ── Actions row ────────────────────────────────────────────────── */
function CartActionsRow({ editMode, hasItems, selectedCount, onToggleEdit, onDeleteSelected }: {
  editMode: boolean; hasItems: boolean; selectedCount: number;
  onToggleEdit: () => void; onDeleteSelected: () => void;
}) {
  if (!hasItems) return null;
  return (
    <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 8, paddingInline: 16, paddingTop: 2 }}>
      <button
        onClick={editMode && selectedCount > 0 ? onDeleteSelected : onToggleEdit}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 30, border: `1px solid ${editMode ? (selectedCount > 0 ? "var(--error)" : "var(--gold)") : "var(--border)"}`, background: editMode ? (selectedCount > 0 ? "var(--accent-bg)" : "var(--gold-light)") : "var(--bg-card)", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 700, color: editMode ? (selectedCount > 0 ? "var(--error)" : "var(--text-brand)") : "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.15s, background 0.15s" }}>
        {editMode ? (selectedCount > 0 ? <><Trash2 size={12} strokeWidth={2} />حذف ({selectedCount})</> : "تم") : "تعديل"}
      </button>
      {editMode && selectedCount === 0 && (
        <span style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "var(--text-muted)" }}>اختر العناصر لحذفها</span>
      )}
    </div>
  );
}

/* ── Cart Item Row ──────────────────────────────────────────────── */
function CartItemRow({ item, editMode, selected, onSelect, onQtyChange, onRemove }: {
  item: CartItem; editMode: boolean; selected: boolean;
  onSelect: (id: number) => void;
  onQtyChange: (id: number, color: string, delta: number) => void;
  onRemove: (id: number, color: string) => void;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-2xl transition-[border-color,box-shadow] duration-150"
      style={{ background: "var(--bg-card)", border: `1px solid ${selected ? "var(--gold)" : "var(--border)"}`, boxShadow: selected ? "0 0 0 1px rgba(166,124,82,0.2)" : "none" }} dir="rtl">
      {editMode && (
        <button onClick={() => onSelect(item.id)} className="flex-shrink-0 flex items-center justify-center self-center" style={{ color: selected ? "var(--text-brand)" : "var(--border)", marginInlineEnd: -4 }} aria-label={selected ? "إلغاء تحديد العنصر" : "تحديد العنصر"}>
          {selected ? <CheckSquare size={20} strokeWidth={2} /> : <Square size={20} strokeWidth={1.5} />}
        </button>
      )}

      <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 80, height: 80, background: "var(--card-img-bg)" }}>
        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-bold" style={{ color: "var(--text-brand)" }}>{item.brand}</p>
          <p className="font-semibold line-clamp-1 mt-0.5" style={{ fontSize: "13px", color: "var(--text-primary)" }}>{item.name}</p>
          {item.color && (
            <div className="flex items-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-full border" style={{ background: item.color, borderColor: "rgba(0,0,0,0.1)" }} />
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{item.color}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="font-bold" style={{ fontSize: "15px", color: "var(--text-price)" }}>
            {(item.price * item.qty).toLocaleString("ar-SA")}
            <span className="text-[10px] font-normal" style={{ color: "var(--text-secondary)", marginInlineStart: 2 }}>ر.س</span>
          </span>

          {!editMode && (
            <div className="flex items-center gap-0.5">
              <button onClick={() => onRemove(item.id, item.color)}
                style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }}
                aria-label="إزالة من السلة">
                <div className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: "#FEF0EE", color: "var(--error)" }}>
                  <Trash2 size={12} />
                </div>
              </button>
              <div className="flex items-center rounded-full" style={{ background: "var(--gold-light)", border: "1px solid #e8d9c0" }}>
                <button onClick={() => onQtyChange(item.id, item.color, -1)}
                  style={{ minWidth: 40, minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-brand)", background: "none", border: "none", cursor: "pointer" }}
                  aria-label="تقليل الكمية">
                  <Minus size={12} strokeWidth={2.5} />
                </button>
                <span className="text-[13px] font-bold w-5 text-center" style={{ color: "var(--text-primary)" }}>{item.qty}</span>
                <button onClick={() => onQtyChange(item.id, item.color, 1)}
                  style={{ minWidth: 40, minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-brand)", background: "none", border: "none", cursor: "pointer" }}
                  aria-label="زيادة الكمية">
                  <Plus size={12} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Cart Upsell ────────────────────────────────────────────────── */
function CartUpsell() {
  const { data: products = [] } = useGetProducts();
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const suggestions = useMemo(() => products.slice(0, 6), [products]);
  if (suggestions.length === 0) return null;
  return (
    <div style={{ margin: "6px 0 0" }} dir="rtl">
      <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", padding: "12px 12px 8px" }}>
        قد يعجبك أيضاً
      </p>
      <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 12px 14px" }}>
        {suggestions.map((p) => (
          <div key={p.id} style={{ flexShrink: 0, width: 110, borderRadius: 14, overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border-warm)", cursor: "pointer" }}
            onClick={() => navigate(`/product/${p.id}`)}>
            <div style={{ width: "100%", aspectRatio: "1/1", background: "var(--card-img-bg)", position: "relative" }}>
              <img src={p.image} alt={p.name} loading="lazy"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: 8 }}
                onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
            </div>
            <div style={{ padding: "7px 8px 9px" }}>
              <p className="line-clamp-2" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 5 }}>{p.name}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-price)" }}>{p.price.toLocaleString("ar-SA")}</span>
                <button onClick={(e) => { e.stopPropagation(); addToCart(p, p.colors?.[0]); }}
                  style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }}
                  aria-label="أضف للسلة">
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold-light)", border: "1px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus size={13} style={{ color: "var(--text-brand)" }} />
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── PAGE ───────────────────────────────────────────────────────── */
export function CartPage() {
  const { items, total, discountAmount, couponCode, removeFromCart, updateQty } = useCart();
  const [, navigate] = useLocation();
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [query, setQuery]       = useState("");

  const filtered = useMemo(() =>
    query.trim() ? items.filter((it) => it.name.includes(query) || it.brand.toLowerCase().includes(query.toLowerCase())) : items,
    [items, query]
  );

  const shipping   = calcShipping(total);
  const grandTotal = total - discountAmount + shipping;

  function handleSelect(id: number) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function handleDeleteSelected() {
    const toDelete = items.filter(i => selected.has(i.id));
    toDelete.forEach((i) => removeFromCart(i.id, i.color));
    setSelected(new Set()); setEditMode(false);
    toast(`تم حذف ${toDelete.length} عنصر${toDelete.length > 1 ? "ات" : ""} من السلة`, { duration: 4000, position: "top-center" });
  }

  return (
    <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: "var(--nav-h)", background: "var(--bg-surface-warm)" }}>
      <h1 className="sr-only">السلة</h1>
      <SearchBar
        placeholder="ابحث في السلة..."
        value={query} onChange={setQuery}
        filtersRow={
          <CartActionsRow editMode={editMode} hasItems={items.length > 0} selectedCount={selected.size}
            onToggleEdit={() => { setEditMode((v) => !v); setSelected(new Set()); }}
            onDeleteSelected={handleDeleteSelected} />
        }
      />

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--gold-light)" }}>
            <ShoppingBag size={32} style={{ color: "var(--text-brand)" }} strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-center" style={{ color: "var(--text-primary)", fontSize: "16px" }}>السلة فارغة</p>
          <p className="text-center" style={{ color: "var(--text-muted)", fontSize: "13px" }}>أضف منتجاتك المفضلة وابدأ التسوق</p>
          <button onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold"
            style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-accent))", color: "#fff", fontSize: "13px", fontFamily: "var(--font-main)" }}>
            <ArrowRight size={15} strokeWidth={2} />
            ابدأ التسوق
          </button>
        </div>
      ) : (
        <>
          <FreeShippingBar total={total} />

          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col" dir="rtl">
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 12px 0" }}>
              {filtered.length === 0 ? (
                <p className="text-center pt-8" style={{ color: "var(--text-muted)", fontSize: 13 }}>لا توجد نتائج</p>
              ) : (
                filtered.map((item) => (
                  <CartItemRow key={`${item.id}-${item.color}`} item={item} editMode={editMode} selected={selected.has(item.id)}
                    onSelect={handleSelect}
                    onQtyChange={updateQty}
                    onRemove={(id, color) => {
                      const itemName = items.find(i => i.id === id && i.color === color)?.name;
                      removeFromCart(id, color);
                      if (itemName) toast(`حُذف "${itemName}" من السلة`, { duration: 3000, position: "top-center" });
                    }} />
                ))
              )}
            </div>

            {!editMode && <div style={{ marginTop: 12 }}><CouponInput /></div>}
            {!editMode && <CartUpsell />}

            {!editMode && (
              <div style={{ margin: "4px 12px 12px", borderRadius: 18, background: "var(--bg-card)", border: "1px solid var(--border-warm)", overflow: "hidden" }}>
                {[
                  { label: "إجمالي المنتجات", value: `${total.toLocaleString("ar-SA")} ر.س`, green: false },
                  ...(discountAmount > 0 ? [{ label: `خصم الكوبون (${couponCode})`, value: `- ${discountAmount.toLocaleString("ar-SA")} ر.س`, green: true }] : []),
                  { label: "رسوم الشحن", value: shipping === 0 ? "مجاني 🎉" : `${shipping} ر.س`, green: shipping === 0 },
                ].map(({ label, value, green }) => (
                  <div key={label} className="flex items-center justify-between" style={{ padding: "11px 14px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{label}</span>
                    <span className="font-semibold" style={{ fontSize: "13px", color: green ? "var(--success)" : "var(--text-primary)" }}>{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between" style={{ padding: "13px 14px" }}>
                  <span className="font-bold" style={{ fontSize: "15px", color: "var(--text-primary)" }}>الإجمالي</span>
                  <span className="font-bold" style={{ fontSize: "17px", color: "var(--text-brand)" }}>{grandTotal.toLocaleString("ar-SA")} ر.س</span>
                </div>
              </div>
            )}
          </div>

          {!editMode && (
            <div className="px-3 pt-2 pb-3" style={{ flexShrink: 0, background: "#fafaf8", borderTop: "1px solid var(--border-warm)" }}>
              {/* T24: Trust microcopy in cart CTA */}
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 10 }} dir="rtl">
                {[
                  { icon: "🔒", text: "دفع آمن 100%" },
                  { icon: "✓", text: "منتجات أصلية" },
                  { icon: "↩", text: "إرجاع مجاني 30 يوماً" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11 }}>{icon}</span>
                    <span style={{ fontFamily: "var(--font-main)", fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>{text}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => navigate("/checkout")}
                variant="primary"
                size="lg"
                className="w-full rounded-2xl"
                style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-accent))" }}>
                إتمام الطلب — {grandTotal.toLocaleString("ar-SA")} ر.س
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
