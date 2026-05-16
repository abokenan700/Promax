import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import {
  ArrowRight, ArrowUpRight, X,
  LayoutGrid, Trash2, Sparkles, Clock, Heart,
} from "lucide-react";
import type { Product } from "@workspace/api-client-react";
import { API_BASE } from "../lib/apiBase";
import { CartButton } from "../components/CartButton";
import { SearchBar } from "../components/SearchBar";
import { SectionHeader } from "../components/SectionHeader";
import { useWishlist } from "../context/WishlistContext";
import { Stars } from "../components/Stars";
import {
  type Filters, DEFAULT_FILTERS,
  SortSheet, FilterSheet, ControlsBar,
} from "../components/SearchFilters";

/* ─── Static discovery data ───────────────────────────────────── */
const TRENDING_CHIPS = [
  { label: "شنط",           image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&q=80&fm=webp",  bg: "#F2ECE4" },
  { label: "ساعات",         image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=120&q=80&fm=webp", bg: "#EDEAE5" },
  { label: "عطور",          image: "/perfume-hero.png", bg: "#F5EDE0" },
  { label: "نظارات شمسية", image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=120&q=80&fm=webp",  bg: "#EAEDF2" },
];

const SUGGESTIONS_PAIRS: [string, string][] = [
  ["حقيبة يد جلدية", "فستان صيفي"],
  ["كعب نسائي",      "ساعات رجالية"],
  ["حذاء رجالي",     "كعب نسائي"],
];

const POPULAR_TAGS = [
  "عروض اليوم", "ملابس نسائية", "أحذية رياضية", "إكسسوارات",
  "ساعات نسائية", "شنط ماركات", "عطور اصلية", "ملابس رجالية",
  "نظارات شمسية", "مجوهرات", "ملابس أطفال", "وصل جديداً",
];

interface RecentProduct {
  id: number; name: string; price: number; image: string; badge: string; isNew: boolean;
}

const HISTORY_INITIAL = ["شنطة يد جلدية", "عطر نسائي", "ساعة يد رجالية", "حذاء كعب عالي"];

/* ─── T16: URL param helpers ──────────────────────────────────── */
function filtersToParams(sortKey: string, filters: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (sortKey && sortKey !== "default")    p.set("sort", sortKey);
  if (filters.minPrice !== null)           p.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== null)           p.set("maxPrice", String(filters.maxPrice));
  if (filters.minDiscount !== null)        p.set("minDiscount", String(filters.minDiscount));
  if (filters.minRating !== null)          p.set("minRating", String(filters.minRating));
  if (filters.isNew)                       p.set("isNew", "1");
  return p;
}

function paramsToFilters(params: URLSearchParams): Filters {
  return {
    minPrice:    params.has("minPrice")    ? Number(params.get("minPrice"))    : null,
    maxPrice:    params.has("maxPrice")    ? Number(params.get("maxPrice"))    : null,
    minDiscount: params.has("minDiscount") ? Number(params.get("minDiscount")) : null,
    minRating:   params.has("minRating")   ? Number(params.get("minRating"))   : null,
    isNew:       params.get("isNew") === "1",
  };
}

/* ─── Sub-components ──────────────────────────────────────────── */
function SuggestionCell({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <button onClick={onPress}
      style={{ display: "flex", alignItems: "center", padding: "11px 14px", background: "var(--bg-card)", border: "none", cursor: "pointer", width: "100%", gap: 8 }}>
      <ArrowRight size={13} strokeWidth={1.8} style={{ color: "#C8C6C3", flexShrink: 0 }} />
      <span style={{ flex: 1, fontFamily: "var(--font-main)", fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{text}</span>
      <ArrowRight size={13} strokeWidth={1.8} style={{ color: "#C8C6C3", flexShrink: 0, transform: "rotate(180deg)" }} />
    </button>
  );
}

/* ─── Grid result card ────────────────────────────────────────── */
function ResultCard({ item }: { item: Product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [, navigate] = useLocation();
  const liked = isWishlisted(item.id);
  return (
    <article className="card-pressable flex flex-col rounded-2xl overflow-hidden"
      style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", cursor: "pointer" }}
      aria-label={item.name} onClick={() => navigate(`/product/${item.id}`)}>
      <div className="relative" style={{ aspectRatio: "1/1", background: "linear-gradient(145deg,#fdfcfb,#f5f0ea)" }}>
        <img src={item.image} alt={item.name} loading="lazy" className="absolute inset-0 w-full h-full object-contain p-3" onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
          className="absolute top-0 end-0 flex items-start justify-end"
          style={{ minWidth: 44, minHeight: 44, padding: "8px 8px 0 0", background: "transparent", border: "none", cursor: "pointer" }}
          aria-label={liked ? "إزالة من المفضلة" : "إضافة للمفضلة"}>
          <span className="w-6 h-6 flex items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.88)" }}>
            <Heart size={11} className={liked ? "fill-red-400 stroke-red-400" : "stroke-[#9D9EA4] fill-none"} />
          </span>
        </button>
        {item.is_new && <span className="absolute top-2 start-2 text-white rounded-full px-1.5 py-0.5 leading-none" style={{ fontSize: 9.5, background: "linear-gradient(135deg,var(--gold),var(--gold-accent))", fontWeight: 700 }}>جديد</span>}
        {item.discount > 0 && <span className="absolute bottom-2 start-2 rounded-full px-1.5 py-0.5 leading-none" style={{ fontSize: 9, background: "var(--discount-bg)", color: "var(--discount-text)", fontWeight: 700 }}>-{item.discount}%</span>}
      </div>
      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--gold),transparent)", opacity: 0.4 }} />
      <div className="flex flex-col gap-1 px-2.5 pt-1.5 pb-2.5" dir="rtl">
        <p className="leading-snug font-bold" style={{ fontSize: 10, color: "var(--text-brand)" }}>{item.brand}</p>
        <p className="leading-snug line-clamp-1 font-semibold" style={{ fontSize: 11.5, color: "var(--text-primary)" }}>{item.name}</p>
        <Stars rating={item.rating} />
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold" style={{ fontSize: 13, color: "var(--text-price)" }}>{item.price.toLocaleString("ar-SA")}</span>
            <span style={{ fontSize: 9.5, color: "var(--text-secondary)" }}>ر.س</span>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <CartButton size="sm" product={item} selectedColor={item.colors?.[0]} />
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── List result card ────────────────────────────────────────── */
function ResultCardList({ item }: { item: Product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [, navigate] = useLocation();
  const liked = isWishlisted(item.id);
  return (
    <article className="card-pressable flex rounded-2xl overflow-hidden"
      style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", cursor: "pointer", direction: "rtl" }}
      aria-label={item.name} onClick={() => navigate(`/product/${item.id}`)}>
      <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0, background: "var(--card-img-bg)" }}>
        <img src={item.image} alt={item.name} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: 10 }} onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
        {item.is_new && <span style={{ position: "absolute", top: 6, insetInlineStart: 6, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "linear-gradient(135deg,var(--gold),var(--gold-accent))", color: "#fff" }}>جديد</span>}
      </div>
      <div style={{ height: "auto", width: 1, background: "linear-gradient(180deg,transparent,var(--gold),transparent)", opacity: 0.4, flexShrink: 0 }} />
      <div className="flex flex-col justify-between flex-1 min-w-0" style={{ padding: "10px 12px" }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-brand)", marginBottom: 2 }}>{item.brand}</p>
          <p className="line-clamp-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 4 }}>{item.name}</p>
          <Stars rating={item.rating} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-price)" }}>{item.price.toLocaleString("ar-SA")}</span>
            <span style={{ fontSize: 10, color: "var(--text-secondary)", marginInlineStart: 2 }}>ر.س</span>
            {item.discount > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "var(--discount-bg)", color: "var(--discount-text)", marginInlineStart: 6 }}>{item.discount}%</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--border-warm)", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Heart size={13} className={liked ? "fill-red-400 stroke-red-400" : "stroke-[#9D9EA4] fill-none"} />
            </button>
            <div onClick={(e) => e.stopPropagation()}>
              <CartButton size="sm" product={item} selectedColor={item.colors?.[0]} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── useSearchProducts hook ──────────────────────────────────── */
function useSearchProducts(query: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) { setResults([]); setLoading(false); setError(false); return; }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setError(false);
    fetch(`${API_BASE}/products?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => { setResults(data as Product[]); setLoading(false); })
      .catch((e) => { if (e.name !== "AbortError") { setError(true); setLoading(false); } });
    return () => ctrl.abort();
  }, [query]);

  return { results, loading, error };
}

/* ─── Page ────────────────────────────────────────────────────── */
export function SearchPage() {
  const [, navigate] = useLocation();
  const searchStr = useSearch();

  /* T17: Sync URL → state when URL changes */
  const urlParams = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const qParam = urlParams.get("q") ?? urlParams.get("brand") ?? "";

  const [query, setQuery]   = useState(qParam);
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("nakhba_search_history");
      return stored ? (JSON.parse(stored) as string[]) : HISTORY_INITIAL;
    } catch { return HISTORY_INITIAL; }
  });
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>(() => {
    try {
      const stored = localStorage.getItem("nakhba_recent_viewed");
      return stored ? (JSON.parse(stored) as RecentProduct[]) : [];
    } catch { return []; }
  });

  /* T16: Read sort/filter from URL */
  const [sortKey, setSortKey] = useState(() => urlParams.get("sort") ?? "default");
  const [filters, setFilters] = useState<Filters>(() => paramsToFilters(urlParams));
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  /* T17: When URL search string changes externally, sync to state */
  useEffect(() => {
    const params = new URLSearchParams(searchStr);
    const q = params.get("q") ?? params.get("brand") ?? "";
    if (q !== query) setQuery(q);
    const newSort = params.get("sort") ?? "default";
    if (newSort !== sortKey) setSortKey(newSort);
    const newFilters = paramsToFilters(params);
    setFilters(newFilters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchStr]);

  useEffect(() => {
    function syncRecent() {
      try {
        const stored = localStorage.getItem("nakhba_recent_viewed");
        if (stored) setRecentProducts(JSON.parse(stored) as RecentProduct[]);
      } catch {}
    }
    window.addEventListener("focus", syncRecent);
    return () => window.removeEventListener("focus", syncRecent);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("nakhba_search_history", JSON.stringify(history)); } catch {}
  }, [history]);

  const { results, loading } = useSearchProducts(query);

  function applyQuery(q: string) {
    setQuery(q);
    if (q.trim() && !history.includes(q.trim())) {
      setHistory((prev) => [q.trim(), ...prev.slice(0, 9)]);
    }
    /* T16: push query to URL */
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    navigate(`/search${p.toString() ? `?${p.toString()}` : ""}`);
  }

  /* T16: Push filter + sort changes to URL */
  function handleSortChange(key: string) {
    setSortKey(key);
    const p = new URLSearchParams(searchStr);
    if (key === "default") p.delete("sort"); else p.set("sort", key);
    navigate(`/search?${p.toString()}`);
  }

  function handleFiltersChange(newFilters: Filters) {
    setFilters(newFilters);
    const p = new URLSearchParams(searchStr);
    const fp = filtersToParams(sortKey, newFilters);
    fp.forEach((v, k) => p.set(k, v));
    ["minPrice", "maxPrice", "minDiscount", "minRating", "isNew"].forEach(k => { if (!fp.has(k)) p.delete(k); });
    navigate(`/search?${p.toString()}`);
  }

  /* Filter + sort results */
  const processedResults = useMemo(() => {
    let list = [...results];
    if (filters.minPrice !== null)    list = list.filter((p) => p.price >= filters.minPrice!);
    if (filters.maxPrice !== null)    list = list.filter((p) => p.price <= filters.maxPrice!);
    if (filters.minDiscount !== null) list = list.filter((p) => p.discount >= filters.minDiscount!);
    if (filters.minRating !== null)   list = list.filter((p) => p.rating >= filters.minRating!);
    if (filters.isNew)                list = list.filter((p) => p.is_new);
    switch (sortKey) {
      case "price_asc":  list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      case "rating":     list.sort((a, b) => b.rating - a.rating); break;
      case "discount":   list.sort((a, b) => b.discount - a.discount); break;
      case "newest":     list.sort((a, b) => b.id - a.id); break;
    }
    return list;
  }, [results, filters, sortKey]);

  const hasActiveFilters = filters.minPrice !== null || filters.maxPrice !== null || filters.minDiscount !== null || filters.minRating !== null || filters.isNew;

  function removeFilter(key: keyof Filters) {
    const updated = { ...filters, [key]: key === "isNew" ? false : null };
    handleFiltersChange(updated);
  }

  const showResults = query.trim().length >= 1;

  return (
    <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: "var(--nav-h)", background: "var(--bg-page)", position: "relative" }}>
      <h1 className="sr-only">البحث</h1>

      <SearchBar
        placeholder="ابحث عن منتجات، ماركات والمزيد..."
        value={query}
        onChange={setQuery}
        onClear={() => { setQuery(""); navigate("/search"); }}
        onKeyDown={(e) => e.key === "Enter" && applyQuery(query)}
        autoFocus
      />

      <div className="hide-scrollbar" style={{ flex: "1 1 auto", overflowY: "auto", overflowX: "hidden" }}>

        {showResults ? (
          <div>
            {/* T18: ControlsBar — always show when loading is done and there are results OR active filters */}
            {!loading && (results.length > 0 || hasActiveFilters) && (
              <ControlsBar
                count={processedResults.length}
                sort={sortKey}
                filters={filters}
                viewMode={viewMode}
                onSortOpen={() => setShowSort(true)}
                onFilterOpen={() => setShowFilter(true)}
                onViewToggle={() => setViewMode((v) => v === "grid" ? "list" : "grid")}
                onRemoveFilter={removeFilter}
              />
            )}

            <div style={{ padding: "10px 12px 12px" }}>
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl animate-pulse" style={{ aspectRatio: "0.75", background: "var(--card-bg)", border: "1px solid var(--card-border)" }} />
                  ))}
                </div>
              ) : processedResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--gold-light)" }}>
                    <LayoutGrid size={24} style={{ color: "var(--text-brand)" }} strokeWidth={1.5} />
                  </div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)", fontSize: 15 }}>لا توجد نتائج</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>جرّب تعديل الفلاتر أو كلمات البحث</p>
                  {hasActiveFilters && (
                    <button onClick={() => handleFiltersChange(DEFAULT_FILTERS)}
                      style={{ padding: "9px 20px", borderRadius: 12, border: "1px solid var(--gold)", background: "transparent", color: "var(--text-brand)", fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      إعادة ضبط الفلاتر
                    </button>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 gap-3">
                  {processedResults.map((item) => <ResultCard key={item.id} item={item} />)}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {processedResults.map((item) => <ResultCardList key={item.id} item={item} />)}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Discovery View */
          <>
            {/* الأكثر بحثاً */}
            <div style={{ paddingTop: 16, paddingBottom: 18 }}>
              <div style={{ paddingInline: 16 }}>
                <SectionHeader title="الأكثر بحثاً" icon={<ArrowUpRight size={14} strokeWidth={2.5} />} />
              </div>
              <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingInline: 16 }} dir="rtl">
                {TRENDING_CHIPS.map((chip) => (
                  <button key={chip.label} onClick={() => applyQuery(chip.label)}
                    style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 7, paddingInlineEnd: 12, paddingInlineStart: 6, paddingTop: 5, paddingBottom: 5, borderRadius: 40, border: "1px solid var(--border-warm)", background: "var(--bg-card)", cursor: "pointer" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: chip.bg }}>
                      <img src={chip.image} alt={chip.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 8, background: "#F4F3F1" }} />

            {/* اقتراحات */}
            <div style={{ paddingTop: 16, paddingBottom: 4 }}>
              <div style={{ paddingInline: 16 }}><SectionHeader title="اقتراحات لك" icon={<Sparkles size={13} strokeWidth={2} />} /></div>
              <div style={{ borderTop: "1px solid #EDEAE6" }}>
                {SUGGESTIONS_PAIRS.map(([right, left], i) => (
                  <div key={i} style={{ display: "flex", borderBottom: "1px solid #EDEAE6" }} dir="rtl">
                    <div style={{ flex: 1, borderInlineEnd: "1px solid #EDEAE6" }}><SuggestionCell text={right} onPress={() => applyQuery(right)} /></div>
                    <div style={{ flex: 1 }}><SuggestionCell text={left} onPress={() => applyQuery(left)} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 8, background: "#F4F3F1", marginTop: 12 }} />

            {/* الماركات الشائعة */}
            <div style={{ paddingTop: 16, paddingBottom: 18 }}>
              <div style={{ paddingInline: 16 }}><SectionHeader title="الماركات الشائعة" /></div>
              <div className="hide-scrollbar" style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingInline: 16, direction: "ltr" }}>
                {["CHANEL", "Dior", "GUCCI", "LV", "VERSACE", "BURBERRY"].map((brand) => (
                  <button key={brand} onClick={() => applyQuery(brand)}
                    style={{ flexShrink: 0, padding: "6px 14px", fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 700, letterSpacing: 1.5, color: "#1A1A1A", background: "none", border: "none", cursor: "pointer" }}>
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 8, background: "#F4F3F1" }} />

            {/* شوهد مؤخراً */}
            {recentProducts.length > 0 && (
              <>
                <div style={{ paddingTop: 16, paddingBottom: 18 }}>
                  <div style={{ paddingInline: 16 }}><SectionHeader title="تمت مشاهدته مؤخراً" icon={<Clock size={13} strokeWidth={2} />} /></div>
                  <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingInline: 16 }} dir="rtl">
                    {recentProducts.map((p) => (
                      <button key={p.id} onClick={() => navigate(`/product/${p.id}`)}
                        style={{ flexShrink: 0, width: 106, borderRadius: 12, overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border-warm)", textAlign: "start", cursor: "pointer", padding: 0 }}>
                        <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "linear-gradient(145deg,#fdfcfb,#f5ede0)", overflow: "hidden" }}>
                          <img src={p.image} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                        </div>
                        <div style={{ padding: "7px 8px 9px" }} dir="rtl">
                          <p style={{ fontFamily: "var(--font-main)", fontSize: 11.5, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 5 }}>{p.name}</p>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                            <span style={{ fontFamily: "var(--font-main)", fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>
                              {p.price.toLocaleString("ar-SA")}
                              <span style={{ fontSize: 9.5, fontWeight: 400, color: "var(--text-secondary)", marginInlineStart: 1 }}>ر.س</span>
                            </span>
                            {p.badge ? <span style={{ fontFamily: "var(--font-main)", fontSize: 9.5, fontWeight: 700, color: p.isNew ? "var(--success, #5A8A4A)" : "var(--discount-text)", background: p.isNew ? "rgba(90,138,74,0.1)" : "var(--accent-bg)", padding: "2px 6px", borderRadius: 20 }}>{p.badge}</span> : null}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: 8, background: "#F4F3F1" }} />
              </>
            )}

            {/* سجل البحث */}
            {history.length > 0 && (
              <div style={{ paddingTop: 16, paddingBottom: 18 }}>
                <div style={{ paddingInline: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <SectionHeader title="سجل البحث" />
                  <button onClick={() => setHistory([])}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 20, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}>
                    <Trash2 size={11} />مسح الكل
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingInline: 16, paddingTop: 8 }} dir="rtl">
                  {history.map((h) => (
                    <div key={h}
                      style={{ display: "flex", alignItems: "center", gap: 0, borderRadius: 30, border: "1px solid var(--border-warm)", background: "var(--bg-card)", overflow: "hidden" }}>
                      <button onClick={() => applyQuery(h)}
                        style={{ flex: 1, padding: "7px 12px", background: "none", border: "none", cursor: "pointer", textAlign: "start" }}>
                        <span style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "var(--text-secondary)" }}>{h}</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setHistory(prev => prev.filter(x => x !== h)); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "7px 10px 7px 6px", display: "flex", color: "var(--text-muted)" }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* بحث شائع */}
            <div style={{ paddingTop: 16, paddingBottom: 18 }}>
              <div style={{ paddingInline: 16 }}><SectionHeader title="عمليات بحث شائعة" icon={<ArrowUpRight size={14} strokeWidth={2.5} />} /></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingInline: 16 }} dir="rtl">
                {POPULAR_TAGS.map((tag) => (
                  <button key={tag} onClick={() => applyQuery(tag)}
                    style={{ padding: "7px 14px", borderRadius: 30, border: "1px solid var(--border-warm)", background: "var(--bg-card)", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer", transition: "border-color 0.2s" }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sort / Filter sheets */}
      <SortSheet open={showSort} sort={sortKey} onClose={() => setShowSort(false)} onSelect={handleSortChange} />
      <FilterSheet open={showFilter} filters={filters} onClose={() => setShowFilter(false)} onApply={handleFiltersChange} />
    </div>
  );
}
