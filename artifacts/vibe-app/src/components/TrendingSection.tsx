import { useMemo } from "react";
import { useLocation } from "wouter";
import { useGetProducts } from "@workspace/api-client-react";
import { TrendingUp } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { SectionHeader } from "./SectionHeader";
import { Stars } from "./Stars";

export function TrendingSection() {
  const { data: products = [], isLoading } = useGetProducts();
  const [, navigate] = useLocation();
  const { isWishlisted: _iw } = useWishlist();
  const { addToCart: _ac } = useCart();

  const trending = useMemo(() =>
    [...products].sort((a, b) => b.sales - a.sales).slice(0, 6),
    [products]
  );

  void _iw; void _ac;

  return (
    <div style={{ background: "var(--bg-page)", padding: "6px 0 12px" }}>
      <div style={{ padding: "12px 12px 10px" }}>
        <SectionHeader
          title="الأكثر مبيعاً"
          icon={<TrendingUp size={14} strokeWidth={2} style={{ color: "var(--text-brand)" }} />}
          onViewAll={() => navigate("/search")}
        />
      </div>

      <div className="hide-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 12px" }} dir="rtl">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ flexShrink: 0, width: 140, borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <div className="skeleton" style={{ width: "100%", aspectRatio: "1/1" }} />
              <div style={{ height: 1, background: "var(--border)" }} />
              <div style={{ padding: "9px 10px 11px", display: "flex", flexDirection: "column", gap: 5 }}>
                <div className="skeleton" style={{ height: 8, width: "48%", borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 10, width: "82%", borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 10, width: "68%", borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 8, width: "55%", borderRadius: 4 }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                  <div className="skeleton" style={{ height: 14, width: "44%", borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 18, width: "30%", borderRadius: 4 }} />
                </div>
              </div>
            </div>
          ))
          : trending.map((p, index) => {
            const rankColors = [
              { bg: "#D4AF37", text: "#1A1A1A" },
              { bg: "#B0B0B0", text: "#1A1A1A" },
              { bg: "#A67C52", text: "#fff"    },
            ];
            const rank = index < 3 ? rankColors[index] : { bg: "var(--border)", text: "var(--text-muted)" };

            return (
              <div
                key={p.id}
                className="card-pressable"
                style={{ flexShrink: 0, width: 140, borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--card-bg)", border: "1px solid var(--card-border)", cursor: "pointer", position: "relative" }}
                onClick={() => navigate(`/product/${p.id}`)}
              >
                {/* Rank badge */}
                <div style={{ position: "absolute", top: 8, insetInlineStart: 8, zIndex: 2, width: 24, height: 24, borderRadius: "50%", background: rank.bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: rank.text }}>{index + 1}</span>
                </div>

                <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "var(--card-img-bg)" }}>
                  <img src={p.image} alt={p.name} loading="lazy"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: 12 }}
                    onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                </div>

                <div className="gold-divider" />

                <div style={{ padding: "8px 10px 12px" }} dir="rtl">
                  <p style={{ fontSize: "var(--text-2xs)", fontWeight: 700, color: "var(--text-brand)", marginBottom: 2 }}>{p.brand}</p>
                  <p className="line-clamp-2" style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 5 }}>{p.name}</p>
                  <div className="flex items-center gap-1">
                    <Stars rating={p.rating} size={8} />
                    <span style={{ fontSize: "var(--text-2xs)", color: "var(--text-muted)", marginInlineStart: 1 }}>{p.rating}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 7 }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-main)", fontSize: "var(--text-base)", fontWeight: 800, color: "var(--text-price)" }}>{p.price.toLocaleString("ar-SA")}</span>
                      <span style={{ fontSize: "var(--text-2xs)", color: "var(--text-secondary)", marginInlineStart: 2 }}>ر.س</span>
                    </div>
                    {p.discount > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "var(--accent-bg)", color: "var(--accent)" }}>{p.discount}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
