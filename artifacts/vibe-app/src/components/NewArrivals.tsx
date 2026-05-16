import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useGetProducts } from "@workspace/api-client-react";
import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { CartButton } from "./CartButton";
import { SectionHeader } from "./SectionHeader";

const TABS = [
  { key: "all", label: "الكل" },
  { key: "new", label: "الأحدث" },
];

export function NewArrivals() {
  const { data: products = [], isLoading } = useGetProducts();
  const [activeTab, setActiveTab] = useState("all");
  const [, navigate] = useLocation();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const filtered = useMemo(() => {
    const base = products.filter((p) => p.is_new || p.discount < 10);
    if (activeTab === "new") return [...base].sort((a, b) => b.id - a.id).slice(0, 8);
    return base.slice(0, 8);
  }, [products, activeTab]);

  return (
    <div style={{ background: "var(--bg-page)", paddingBottom: 8 }}>
      {/* Header */}
      <div style={{ padding: "18px 12px 0" }}>
        <SectionHeader title="وصل حديثاً" onViewAll={() => navigate("/search")} />
      </div>

      {/* Filter tabs */}
      <div className="hide-scrollbar" style={{ display: "flex", gap: 8, padding: "10px 12px 12px", overflowX: "auto" }} dir="rtl">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{
              flexShrink: 0, padding: "7px 16px", borderRadius: 20, cursor: "pointer",
              fontFamily: "var(--font-main)", fontSize: "var(--text-sm)", fontWeight: 600,
              background: activeTab === key ? "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)" : "var(--bg-card)",
              color: activeTab === key ? "#fff" : "var(--text-secondary)",
              border: activeTab === key ? "none" : "1px solid var(--border-warm)",
              transition: "background 0.2s, color 0.2s",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 12px" }} dir="rtl">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse" style={{ borderRadius: "var(--radius-card)", overflow: "hidden", background: "#EDE8E2" }}>
              <div style={{ aspectRatio: "1/1" }} />
              <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ height: 9, width: "50%", background: "#DDD8CF", borderRadius: 4 }} />
                <div style={{ height: 11, width: "80%", background: "#DDD8CF", borderRadius: 4 }} />
                <div style={{ height: 14, width: "40%", background: "#DDD8CF", borderRadius: 4 }} />
              </div>
            </div>
          ))
          : filtered.map((p) => {
            const liked = isWishlisted(p.id);
            return (
              <div key={p.id} className="card-pressable"
                style={{ borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--card-bg)", border: "1px solid var(--card-border)", cursor: "pointer" }}
                onClick={() => navigate(`/product/${p.id}`)}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "var(--card-img-bg)" }}>
                  <img src={p.image} alt={p.name} loading="lazy"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: 12 }}
                    onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                  {/* NEW badge with pulse */}
                  {p.is_new && (
                    <span className="new-badge-pulse" style={{ position: "absolute", top: 8, insetInlineStart: 8, background: "linear-gradient(135deg,var(--gold),var(--gold-accent))", color: "#fff", fontSize: 9.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>
                      NEW
                    </span>
                  )}
                  {/* Wishlist */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                    className="absolute top-0 end-0 flex items-start justify-end"
                    style={{ minWidth: 44, minHeight: 44, padding: "8px 8px 0 0", background: "transparent", border: "none", cursor: "pointer" }}
                    aria-label={liked ? "إزالة من المفضلة" : "إضافة للمفضلة"}>
                    <span className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.9)" }}>
                      <Heart size={13} className={liked ? "fill-red-400 stroke-red-400" : "stroke-[#9D9EA4] fill-none"} />
                    </span>
                  </button>
                </div>
                <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--gold),transparent)", opacity: 0.4 }} />
                <div style={{ padding: "8px 10px 12px" }}>
                  <p style={{ fontSize: "var(--text-2xs)", fontWeight: 700, color: "var(--text-brand)", marginBottom: 2 }}>{p.brand}</p>
                  <p className="line-clamp-2" style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.35, marginBottom: 7 }}>{p.name}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-main)", fontSize: "var(--text-base)", fontWeight: 800, color: "var(--text-price)" }}>{p.price.toLocaleString("ar-SA")}</span>
                      <span style={{ fontSize: "var(--text-2xs)", color: "var(--text-secondary)", marginInlineStart: 2 }}>ر.س</span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <CartButton size="sm" product={p} selectedColor={p.colors?.[0]} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
