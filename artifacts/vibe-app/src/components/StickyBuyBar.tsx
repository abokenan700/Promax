import { Heart, ShoppingBag, Check } from "lucide-react";
import type { Product } from "@workspace/api-client-react";

interface StickyBuyBarProps {
  product:    Product;
  liked:      boolean;
  added:      boolean;
  isOOS:      boolean;   /* T3: out of stock */
  onAdd:      () => void;
  onBuy:      () => void;
  onWishlist: () => void;
}

/** مكوّن شريط الشراء الثابت */
export function StickyBuyBar({ product, liked, added, isOOS, onAdd, onBuy, onWishlist }: StickyBuyBarProps) {
  return (
    <div className="sticky-buy-bar" style={{
      position: "absolute", bottom: "var(--nav-h)", insetInlineStart: 0, insetInlineEnd: 0,
      background: "var(--bg-card)", borderTop: "1px solid var(--border-warm)",
      padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
      zIndex: 20, boxShadow: "var(--shadow-sticky)",
    }} dir="rtl">
      <button onClick={onWishlist}
        style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--border-warm)", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
        <Heart size={17} className={liked ? "fill-red-400 stroke-red-400" : "stroke-[#555] fill-none"} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* T14: scarcity label when stock is very low */}
        {!isOOS && product.stock > 0 && product.stock < 5 && (
          <p style={{ fontFamily: "var(--font-main)", fontSize: "var(--text-2xs)", color: "#C0392B", fontWeight: 700, lineHeight: 1, marginBottom: 2 }}>
            تبقّى {product.stock} فقط!
          </p>
        )}
        {isOOS && (
          <p style={{ fontFamily: "var(--font-main)", fontSize: "var(--text-2xs)", color: "var(--text-muted)", lineHeight: 1, marginBottom: 2 }}>
            نفذ المخزون
          </p>
        )}
        {!isOOS && product.stock >= 5 && (
          <p style={{ fontFamily: "var(--font-main)", fontSize: "var(--text-2xs)", color: "var(--text-muted)", lineHeight: 1, marginBottom: 2 }}>السعر الآن</p>
        )}
        <p style={{ fontFamily: "var(--font-main)", fontSize: "var(--text-lg)", fontWeight: 800, color: isOOS ? "var(--text-muted)" : "var(--text-price)", lineHeight: 1 }}>
          {product.price.toLocaleString("ar-SA")}<span style={{ fontSize: "var(--text-2xs)", fontWeight: 400, marginInlineStart: 2 }}>ر.س</span>
        </p>
      </div>

      {/* T3: disable buttons when OOS */}
      <button onClick={isOOS ? undefined : onAdd} disabled={isOOS}
        style={{ padding: "11px 16px", borderRadius: "var(--radius-md)", border: "none", cursor: isOOS ? "not-allowed" : "pointer", background: isOOS ? "var(--border)" : added ? "linear-gradient(135deg,var(--gold),var(--gold-accent))" : "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)", color: isOOS ? "var(--text-muted)" : "#fff", fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, flexShrink: 0, transition: "background 0.3s", opacity: isOOS ? 0.6 : 1 }}>
        {isOOS ? "نفذ" : added ? <><Check size={14} />تمت ✓</> : <><ShoppingBag size={14} />أضف للسلة</>}
      </button>
      <button onClick={isOOS ? undefined : onBuy} disabled={isOOS}
        style={{ padding: "11px 16px", borderRadius: "var(--radius-md)", cursor: isOOS ? "not-allowed" : "pointer", border: `1.5px solid ${isOOS ? "var(--border)" : "var(--gold)"}`, background: "transparent", color: isOOS ? "var(--text-muted)" : "var(--text-brand)", fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, flexShrink: 0, opacity: isOOS ? 0.5 : 1 }}>
        اشتري الآن
      </button>
    </div>
  );
}
