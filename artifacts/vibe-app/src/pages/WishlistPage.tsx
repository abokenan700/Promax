import { Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { CartButton } from "../components/CartButton";
import { SearchBar } from "../components/SearchBar";
import { useWishlist } from "../context/WishlistContext";
import type { Product } from "@workspace/api-client-react";

type SortKey = "newest" | "price-asc" | "price-desc" | "discount";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest",     label: "الأحدث"       },
  { key: "price-asc",  label: "الأقل سعراً"  },
  { key: "price-desc", label: "الأعلى سعراً" },
  { key: "discount",   label: "أعلى خصم"     },
];

function sortItems(items: Product[], sort: SortKey): Product[] {
  const c = [...items];
  if (sort === "price-asc")  return c.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return c.sort((a, b) => b.price - a.price);
  if (sort === "discount")   return c.sort((a, b) => b.discount - a.discount);
  return c;
}

/* ════════════════════════════════════════════════════════════════
   SORT CHIPS ROW
════════════════════════════════════════════════════════════════ */
function SortChips({
  sort,
  onSortChange,
}: {
  sort: SortKey;
  onSortChange: (k: SortKey) => void;
}) {
  return (
    <div
      className="hide-scrollbar"
      role="radiogroup"
      aria-label="ترتيب المفضلة"
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        paddingInline: 16,
        paddingTop: 2,
      }}
      dir="rtl"
    >
      {SORT_OPTIONS.map((opt) => {
        const active = sort === opt.key;
        return (
          <button
            key={opt.key}
            role="radio"
            aria-checked={active}
            onClick={() => onSortChange(opt.key)}
            style={{
              flexShrink: 0,
              padding: "7px 14px",
              borderRadius: 30,
              border: `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
              background: active ? "var(--gold-light)" : "var(--bg-card)",
              fontFamily: "var(--font-main)",
              fontSize: 12,
              fontWeight: active ? 700 : 500,
              color: active ? "var(--text-brand)" : "var(--text-secondary)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.15s, border-color 0.15s, color 0.15s, font-weight 0.15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   WISH CARD
════════════════════════════════════════════════════════════════ */
function WishCard({ item, onRemove }: { item: Product; onRemove: (id: number) => void }) {
  const [, navigate] = useLocation();
  return (
    <article
      className="card-pressable flex flex-col rounded-2xl overflow-hidden"
      style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", cursor: "pointer" }}
      aria-label={`${item.name} — ${item.price.toLocaleString("ar-SA")} ريال`}
      onClick={() => navigate(`/product/${item.id}`)}
    >
      <div className="relative w-full" style={{ aspectRatio: "1 / 1", background: "var(--card-img-bg)" }}>
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain p-3"
          onError={(e) => { e.currentTarget.style.opacity = "0"; }}
        />
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
          className="absolute top-0 end-0 flex items-start justify-end"
          style={{ minWidth: 44, minHeight: 44, padding: "8px 8px 0 0", background: "transparent", border: "none", cursor: "pointer" }}
          aria-label="إزالة من المفضلة"
        >
          <span className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.9)" }}>
            <Heart size={13} className="fill-red-400 stroke-red-400" />
          </span>
        </button>
        {item.discount > 0 && (
          <span
            className="absolute top-2 start-2 rounded-full px-2 py-0.5 font-bold leading-none"
            style={{ fontSize: "clamp(8.5px, 2.3vw, 9.5px)", background: "var(--discount-bg)", color: "var(--discount-text)" }}
          >
            {item.discount}%
          </span>
        )}
      </div>

      <div className="gold-divider" />

      <div className="flex flex-col gap-1 px-2.5 pt-2 pb-2.5">
        <p className="leading-snug font-bold" style={{ fontSize: "clamp(9px, 2.4vw, 10.5px)", color: "var(--text-brand)" }}>{item.brand}</p>
        <p className="leading-snug line-clamp-1 font-semibold" style={{ fontSize: "12px", color: "var(--text-primary)" }}>{item.name}</p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold" style={{ fontSize: "14px", color: "var(--text-price)" }}>
              {item.price.toLocaleString("ar-SA")}
            </span>
            <span style={{ fontSize: "clamp(8.5px, 2.3vw, 9.5px)", color: "var(--text-secondary)" }}>ر.س</span>
          </div>
          <span className="line-through" style={{ fontSize: "clamp(8.5px, 2.3vw, 9.5px)", color: "var(--text-muted)" }}>
            {item.original_price.toLocaleString("ar-SA")}
          </span>
        </div>
        <div className="mt-1" onClick={(e) => e.stopPropagation()}>
          <CartButton size="md" product={item} selectedColor={item.colors?.[0]} />
        </div>
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const [, navigate] = useLocation();
  const [sort, setSort]   = useState<SortKey>("newest");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    const pool = sortItems(wishlist, sort);
    return q
      ? pool.filter((it) => it.name.includes(q) || it.brand.toLowerCase().includes(q.toLowerCase()))
      : pool;
  }, [wishlist, sort, query]);

  return (
    <div
      style={{
        flex: "1 1 auto",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        paddingBottom: "var(--nav-h)",
        background: "var(--bg-surface-warm)",
      }}
    >
      {/* مشكلة 64: h1 مخفي بصرياً */}
      <h1 className="sr-only">المفضلة</h1>
      <SearchBar
        placeholder="ابحث في المفضلة..."
        value={query}
        onChange={setQuery}
        filtersRow={<SortChips sort={sort} onSortChange={setSort} />}
      />

      {wishlist.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--gold-light)" }}>
            <Heart size={32} style={{ color: "var(--text-brand)" }} strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-center" style={{ color: "var(--text-primary)", fontSize: "16px" }}>المفضلة فارغة</p>
          <p className="text-center" style={{ color: "var(--text-muted)", fontSize: "13px" }}>أضف المنتجات التي تعجبك لتجدها هنا</p>
          <button
            onClick={() => navigate("/categories")}
            style={{ padding: "12px 28px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 }}
          >
            تسوّق الآن
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto hide-scrollbar px-3 pt-3">
          {filtered.length === 0 ? (
            <p className="text-center pt-8" style={{ color: "var(--text-muted)", fontSize: 13 }}>لا توجد نتائج</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 pb-3">
              {filtered.map((item) => (
                <WishCard key={item.id} item={item} onRemove={() => toggleWishlist(item)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
