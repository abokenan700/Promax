import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ShoppingBag } from "lucide-react";
import { Categories } from "../components/Categories";
import { SearchBar } from "../components/SearchBar";
import {
  l1Categories,
  getL2ByL1, getL3ByL2, defaultL2,
  type L2Category, type L3Category,
} from "../data/catalog";

const SCROLL_THRESHOLD = 40;

/* ════════════════════════════════════════════════════════════════
   STICKY MINI-HEADER
════════════════════════════════════════════════════════════════ */
function StickyHeader({
  visible,
  activeL1,
}: {
  visible: boolean;
  activeL1: string;
}) {
  const [, navigate] = useLocation();
  const label = l1Categories.find((c) => c.id === activeL1)?.label ?? "";

  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 0,
        insetInlineStart: 0,
        insetInlineEnd: 0,
        zIndex: 30,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.25s cubic-bezier(.4,0,.2,1), opacity 0.2s ease",
        /* مشكلة 125: backdrop-filter مُكلف على الأجهزة المنخفضة — نُبقيه مع will-change للتحسين */
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid #EEEBE7",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        minHeight: 50,
      }}
    >
      <div style={{ position: "relative", width: 44, height: 44 }}>
        <button
          onClick={() => navigate("/cart")}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "var(--gold-light)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label="السلة"
        >
          <ShoppingBag size={17} strokeWidth={1.8} style={{ color: "var(--text-brand)" }} />
        </button>
      </div>

      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text-primary)",
          fontFamily: "var(--font-main)",
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </span>

      <div style={{ width: 36 }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   L3 GRID CARD
════════════════════════════════════════════════════════════════ */
function L3Card({ item }: { item: L3Category }) {
  const [, navigate] = useLocation();
  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      <button
        className="card-pressable w-full overflow-hidden rounded-2xl"
        onClick={() => navigate(`/search?category=${item.id}`)}
        style={{
          aspectRatio: "1 / 1",
          background: "#ffffff",
          border: "1px solid #EEEBE7",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <img
          src={item.image}
          alt={item.label}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.currentTarget.style.opacity = "0.25"; }}
        />
      </button>

      <p
        className="font-semibold leading-tight text-center line-clamp-1 w-full"
        style={{ fontSize: "clamp(9.5px, 2.7vw, 11px)", color: "var(--text-primary)" }}
      >
        {item.label}
      </p>

      <p
        className="leading-none text-center"
        style={{ fontSize: "clamp(8px, 2.2vw, 9.5px)", color: "var(--text-muted)" }}
      >
        {item.count.toLocaleString("ar-SA")} منتج
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   L2 SIDEBAR ITEM
════════════════════════════════════════════════════════════════ */
function L2Item({
  cat,
  isActive,
  onClick,
}: {
  cat: L2Category;
  isActive: boolean;
  onClick: () => void;
}) {
  const { Icon } = cat;
  return (
    <button
      onClick={onClick}
      className="w-full flex flex-col items-center gap-1 py-3 px-1.5 relative transition-colors duration-150"
      style={{ background: isActive ? "var(--gold-light)" : "transparent" }}
    >
      {isActive && (
        <div
          className="absolute inset-inline-end-0 top-1/2 -translate-y-1/2 rounded-s-full"
          style={{ insetInlineEnd: 0, position: "absolute", width: 3, height: "55%", background: "var(--gold-accent)" }}
        />
      )}
      <Icon
        size={18}
        strokeWidth={isActive ? 2.2 : 1.6}
        style={{ color: isActive ? "var(--text-brand)" : "var(--text-secondary)" }}
      />
      {/* مشكلة 42: fontSize:9px أصغر من الحد الأدنى المقروء — تم تصحيحه إلى 11px (WCAG AA) */}
      <span
        className="leading-tight text-center line-clamp-2"
        style={{
          fontSize: "11px",
          color: isActive ? "var(--text-brand)" : "var(--text-secondary)",
          fontWeight: isActive ? 700 : 500,
          maxWidth: "100%",
        }}
      >
        {cat.label}
      </span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   SIDEBAR + GRID  (Levels 2 & 3)
════════════════════════════════════════════════════════════════ */
function CatalogBody({
  activeL1,
  activeL2,
  onL2Change,
  onGridScroll,
}: {
  activeL1: string;
  activeL2: string;
  onL2Change: (id: string) => void;
  onGridScroll: (scrollTop: number) => void;
}) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const l2Items = getL2ByL1(activeL1);
  const l3Items = getL3ByL2(activeL2);

  useEffect(() => {
    const idx = l2Items.findIndex((c) => c.id === activeL2);
    if (sidebarRef.current && idx >= 0) {
      const el = sidebarRef.current.children[idx] as HTMLElement;
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeL2, l2Items]);

  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = 0;
    onGridScroll(0);
  }, [activeL2, onGridScroll]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    onGridScroll(e.currentTarget.scrollTop);
  }

  return (
    <div
      className="flex"
      style={{ flex: "1 1 auto", minHeight: 0, overflow: "hidden" }}
      dir="rtl"
    >
      <div
        ref={sidebarRef}
        className="hide-scrollbar"
        style={{
          flexShrink: 0,
          width: 76,
          overflowY: "auto",
          background: "#ffffff",
          borderInlineStart: "1px solid var(--border)",
        }}
      >
        {l2Items.map((cat) => (
          <L2Item
            key={cat.id}
            cat={cat}
            isActive={activeL2 === cat.id}
            onClick={() => onL2Change(cat.id)}
          />
        ))}
      </div>

      <div
        ref={gridRef}
        key={activeL2}
        onScroll={handleScroll}
        className="hide-scrollbar fade-in-up"
        style={{ flex: 1, overflowY: "auto", background: "#fafaf8" }}
        dir="rtl"
      >
        {l3Items.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 p-3">
            {l3Items.map((item) => (
              <L3Card key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              لا توجد فئات
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export function CategoriesPage() {
  const [activeL1, setActiveL1] = useState("new");
  const [activeL2, setActiveL2] = useState(() => defaultL2("new"));
  const [headerVisible, setHeaderVisible] = useState(false);

  function handleL1Change(id: string) {
    setActiveL1(id);
    setActiveL2(defaultL2(id));
    setHeaderVisible(false);
  }

  const handleGridScroll = useCallback((scrollTop: number) => {
    setHeaderVisible(scrollTop > SCROLL_THRESHOLD);
  }, []);

  return (
    <div
      style={{
        flex: "1 1 auto",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        paddingBottom: "var(--nav-h)",
        position: "relative",
      }}
    >
      {/* مشكلة 64: h1 مخفي بصرياً */}
      <h1 className="sr-only">التصنيفات</h1>
      <StickyHeader visible={headerVisible} activeL1={activeL1} />

      <div style={{ flexShrink: 0 }}>
        <SearchBar
          placeholder="ابحث عن فئة أو منتج..."
          readOnly
          navigateTo="/search"
        />
        <Categories value={activeL1} onChange={handleL1Change} />
      </div>

      <CatalogBody
        activeL1={activeL1}
        activeL2={activeL2}
        onL2Change={setActiveL2}
        onGridScroll={handleGridScroll}
      />
    </div>
  );
}
