import { useState, useEffect } from "react";
import { X, Star, Check, ArrowUpDown, SlidersHorizontal, List, LayoutGrid } from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────── */
export interface Filters {
  minPrice:    number | null;
  maxPrice:    number | null;
  minDiscount: number | null;
  minRating:   number | null;
  isNew:       boolean;
}

export const DEFAULT_FILTERS: Filters = {
  minPrice: null, maxPrice: null, minDiscount: null, minRating: null, isNew: false,
};

export const SORT_OPTIONS = [
  { key: "default",    label: "الافتراضي" },
  { key: "price_asc",  label: "السعر: الأقل أولاً" },
  { key: "price_desc", label: "السعر: الأعلى أولاً" },
  { key: "rating",     label: "الأعلى تقييماً" },
  { key: "discount",   label: "الأكثر خصماً" },
  { key: "newest",     label: "الأحدث" },
];

/* ─── SortSheet ───────────────────────────────────────────────── */
export function SortSheet({ activeSort, onSelect, onClose }: {
  activeSort: string; onSelect: (key: string) => void; onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 200 }}>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet" style={{ padding: "0 0 24px" }} dir="rtl">
        <div className="bottom-sheet-handle" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 14px" }}>
          <h2 style={{ fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>ترتيب النتائج</h2>
          <button onClick={onClose} style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--border-warm)", background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
        <div>
          {SORT_OPTIONS.map(({ key, label }) => (
            <button key={key} onClick={() => { onSelect(key); onClose(); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "13px 16px", background: key === activeSort ? "var(--gold-pale)" : "transparent", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
              <span style={{ fontFamily: "var(--font-main)", fontSize: 14, fontWeight: key === activeSort ? 700 : 400, color: key === activeSort ? "var(--text-brand)" : "var(--text-primary)" }}>{label}</span>
              {key === activeSort && <Check size={16} style={{ color: "var(--gold)" }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── FilterSheet ─────────────────────────────────────────────── */
export function FilterSheet({ filters, onApply, onClose }: {
  filters: Filters; onApply: (f: Filters) => void; onClose: () => void;
}) {
  const [local, setLocal] = useState<Filters>(filters);
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const priceRanges = [
    { label: "أقل من ١٠٠ ر.س",     min: null, max: 100  },
    { label: "١٠٠ — ٥٠٠ ر.س",    min: 100,  max: 500  },
    { label: "٥٠٠ — ١٠٠٠ ر.س",  min: 500,  max: 1000 },
    { label: "أكثر من ١٠٠٠ ر.س", min: 1000, max: null  },
  ];

  const discountOptions = [
    { label: "١٠٪ فأكثر", val: 10 },
    { label: "٢٠٪ فأكثر", val: 20 },
    { label: "٣٠٪ فأكثر", val: 30 },
    { label: "٥٠٪ فأكثر", val: 50 },
  ];

  const ratingOptions = [4, 3];

  function reset() { setLocal(DEFAULT_FILTERS); }

  const activeCount = [
    local.minPrice !== null || local.maxPrice !== null,
    local.minDiscount !== null,
    local.minRating !== null,
    local.isNew,
  ].filter(Boolean).length;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 200 }}>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet hide-scrollbar" dir="rtl">
        <div className="bottom-sheet-handle" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 14px", borderBottom: "1px solid var(--border-warm)" }}>
          <h2 style={{ fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            تصفية النتائج {activeCount > 0 && `(${activeCount})`}
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            {activeCount > 0 && (
              <button onClick={reset}
                style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid var(--border-warm)", background: "transparent", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}>
                إعادة ضبط
              </button>
            )}
            <button onClick={onClose}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--border-warm)", background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </div>

        <div style={{ padding: 16 }}>
          {/* Price Range */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>نطاق السعر</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {priceRanges.map(({ label, min, max }) => {
                const active = local.minPrice === min && local.maxPrice === max;
                return (
                  <button key={label}
                    onClick={() => setLocal((p) => ({ ...p, minPrice: active ? null : min, maxPrice: active ? null : max }))}
                    style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${active ? "var(--gold)" : "var(--border-warm)"}`, background: active ? "var(--gold-pale)" : "var(--bg-card)", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: active ? 700 : 400, color: active ? "var(--text-brand)" : "var(--text-secondary)", cursor: "pointer" }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discount */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>نسبة الخصم</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {discountOptions.map(({ label, val }) => {
                const active = local.minDiscount === val;
                return (
                  <button key={val}
                    onClick={() => setLocal((p) => ({ ...p, minDiscount: active ? null : val }))}
                    style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${active ? "var(--gold)" : "var(--border-warm)"}`, background: active ? "var(--gold-pale)" : "var(--bg-card)", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: active ? 700 : 400, color: active ? "var(--text-brand)" : "var(--text-secondary)", cursor: "pointer" }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>التقييم</p>
            <div style={{ display: "flex", gap: 8 }}>
              {ratingOptions.map((r) => {
                const active = local.minRating === r;
                return (
                  <button key={r}
                    onClick={() => setLocal((p) => ({ ...p, minRating: active ? null : r }))}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${active ? "var(--gold)" : "var(--border-warm)"}`, background: active ? "var(--gold-pale)" : "var(--bg-card)", cursor: "pointer" }}>
                    <Star size={12} style={{ fill: "var(--gold)", stroke: "var(--gold)" }} />
                    <span style={{ fontFamily: "var(--font-main)", fontSize: 12, fontWeight: active ? 700 : 400, color: active ? "var(--text-brand)" : "var(--text-secondary)" }}>{r}+ نجوم</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* New only */}
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => setLocal((p) => ({ ...p, isNew: !p.isNew }))}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${local.isNew ? "var(--gold)" : "var(--border-warm)"}`, background: local.isNew ? "var(--gold-pale)" : "var(--bg-card)", cursor: "pointer" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${local.isNew ? "var(--gold)" : "var(--border)"}`, background: local.isNew ? "var(--gold)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                {local.isNew && <Check size={12} style={{ color: "#fff" }} />}
              </div>
              <span style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: local.isNew ? 700 : 400, color: local.isNew ? "var(--text-brand)" : "var(--text-primary)" }}>وصل حديثاً فقط</span>
            </button>
          </div>

          <button onClick={() => { onApply(local); onClose(); }}
            style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            تطبيق الفلاتر {activeCount > 0 ? `(${activeCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── ControlsBar ─────────────────────────────────────────────── */
export function ControlsBar({ count, sort, filters, viewMode, onSortOpen, onFilterOpen, onViewToggle, onRemoveFilter }: {
  count: number; sort: string; filters: Filters; viewMode: "grid" | "list";
  onSortOpen: () => void; onFilterOpen: () => void; onViewToggle: () => void;
  onRemoveFilter: (key: keyof Filters) => void;
}) {
  const filterCount = [
    filters.minPrice !== null || filters.maxPrice !== null,
    filters.minDiscount !== null,
    filters.minRating !== null,
    filters.isNew,
  ].filter(Boolean).length;

  const activeChips: { key: keyof Filters; label: string }[] = [];
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    activeChips.push({
      key: "minPrice",
      label: filters.maxPrice === null
        ? `${filters.minPrice?.toLocaleString("ar-SA")}+ ر.س`
        : filters.minPrice === null
          ? `حتى ${filters.maxPrice.toLocaleString("ar-SA")} ر.س`
          : `${filters.minPrice?.toLocaleString("ar-SA")} — ${filters.maxPrice?.toLocaleString("ar-SA")} ر.س`,
    });
  }
  if (filters.minDiscount !== null) activeChips.push({ key: "minDiscount", label: `خصم ${filters.minDiscount}%+` });
  if (filters.minRating !== null) activeChips.push({ key: "minRating", label: `${filters.minRating}+ نجوم` });
  if (filters.isNew) activeChips.push({ key: "isNew", label: "وصل حديثاً" });

  const sortLabel = SORT_OPTIONS.find((s) => s.key === sort)?.label ?? "الافتراضي";

  return (
    <div dir="rtl" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-warm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginInlineEnd: 4 }}>{count.toLocaleString("ar-SA")} نتيجة</span>
        <button onClick={onSortOpen}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 20, border: "1px solid var(--border-warm)", background: "var(--bg-card)", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 600, color: sort !== "default" ? "var(--text-brand)" : "var(--text-secondary)", cursor: "pointer" }}>
          <ArrowUpDown size={12} strokeWidth={2} />
          {sort !== "default" ? sortLabel : "الترتيب"}
        </button>
        <button onClick={onFilterOpen}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 20, border: `1px solid ${filterCount > 0 ? "var(--gold)" : "var(--border-warm)"}`, background: filterCount > 0 ? "var(--gold-pale)" : "var(--bg-card)", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 600, color: filterCount > 0 ? "var(--text-brand)" : "var(--text-secondary)", cursor: "pointer" }}>
          <SlidersHorizontal size={12} strokeWidth={2} />
          فلترة {filterCount > 0 ? `(${filterCount})` : ""}
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={onViewToggle}
          style={{ width: 44, height: 44, borderRadius: 10, border: "1px solid var(--border-warm)", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          aria-label={viewMode === "grid" ? "عرض القائمة" : "عرض الشبكة"}>
          {viewMode === "grid"
            ? <List size={14} style={{ color: "var(--text-secondary)" }} />
            : <LayoutGrid size={14} style={{ color: "var(--text-secondary)" }} />}
        </button>
      </div>

      {activeChips.length > 0 && (
        <div className="hide-scrollbar" style={{ display: "flex", gap: 6, padding: "4px 12px 8px", overflowX: "auto" }}>
          {activeChips.map(({ key, label }) => (
            <div key={key}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: "var(--gold-light)", border: "1px solid rgba(192,168,130,0.4)", flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--font-main)", fontSize: 11, fontWeight: 700, color: "var(--text-brand)" }}>{label}</span>
              <button onClick={() => {
                if (key === "minPrice") { onRemoveFilter("minPrice"); onRemoveFilter("maxPrice"); }
                else onRemoveFilter(key);
              }} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "var(--text-brand)" }}>
                <X size={10} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
