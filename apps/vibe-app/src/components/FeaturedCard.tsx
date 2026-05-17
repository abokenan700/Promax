/**
 * مشكلة 32: ProductCard كان مُعرَّفاً مرتين — Products.tsx و FeaturedProducts.tsx
 * هذا المكون يخدم "منتجات مميزة" (شبكة 2 عمود، نجوم، منتقي ألوان، حدود عادية)
 * نظيره للتمرير الأفقي: DealCard.tsx
 */
import { useState } from "react";
import { Heart } from "lucide-react";
import { useLocation } from "wouter";
import type { Product } from "@workspace/api-client-react";
import { CartButton } from "./CartButton";
import { useWishlist } from "../context/WishlistContext";
import { colorToCss, needsBorder } from "../lib/colorMap";

import { Stars } from "./Stars";

function formatSales(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", "٫")} ألف`;
  return n.toLocaleString("ar-SA");
}

export function FeaturedCard({ item }: { item: Product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [activeColor, setActiveColor] = useState(0);
  const [, navigate] = useLocation();
  const liked = isWishlisted(item.id);

  const selectedColor = item.colors?.[activeColor] ?? "";

  // مشكلة 120: aria-label يُعطي السياق لقارئ الشاشة بدل "article" المجهول
  return (
    <article
      aria-label={`${item.name} — ${item.price.toLocaleString("ar-SA")} ريال`}
      className="card-pressable flex flex-col overflow-hidden relative"
      onClick={() => navigate(`/product/${item.id}`)}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "var(--radius-card)",
        cursor: "pointer",
      }}
    >
      <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10">
        {item.is_new ? (
          <span
            className="text-white rounded-full px-2 py-0.5 leading-none"
            style={{ fontSize: "clamp(7.5px, 2vw, 9.5px)", background: "linear-gradient(135deg, var(--gold), var(--gold-accent))", fontWeight: 700 }}
          >
            جديد
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
          aria-label={liked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          className="flex items-center justify-center transition-colors"
          style={{ minWidth: 44, minHeight: 44, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
        >
          <span className="w-6 h-6 flex items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.88)" }}>
            <Heart
              size={12}
              className={`transition-colors ${liked ? "fill-red-400 stroke-red-400" : "stroke-[#9D9EA4] fill-none"}`}
            />
          </span>
        </button>
      </div>

      <div
        className="relative w-full"
        style={{ aspectRatio: "1 / 1", background: "var(--card-img-bg)" }}
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain p-3"
          onError={(e) => { e.currentTarget.style.opacity = "0"; }}
        />
      </div>

      <div className="gold-divider" />

      <div className="flex flex-col gap-1 px-2.5 pt-2 pb-2.5">
        <div className="flex items-center justify-between">
          <p
            className="leading-snug"
            style={{ fontSize: "clamp(10px, 2.8vw, 11.5px)", color: "var(--text-brand)", fontWeight: 700, letterSpacing: "0.4px" }}
          >
            {item.brand}
          </p>
          {item.colors.length > 0 && (
            /* مشكلة 41: النقاط كانت 10/14px — أُضيفت منطقة لمس 32×32 شفافة حول النقطة البصرية الصغيرة */
            <div className="flex items-center" style={{ gap: 0 }}>
              {item.colors.map((c, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveColor(i); }}
                  aria-label={`اللون ${c}`}
                  aria-pressed={i === activeColor}
                  style={{
                    width: 32, height: 32, padding: 0, border: "none", background: "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="rounded-full block transition-[width,height,border,outline] duration-200"
                    style={{
                      width: i === activeColor ? 14 : 10,
                      height: i === activeColor ? 14 : 10,
                      background: colorToCss(c),
                      border: i === activeColor
                        ? "1.5px solid var(--gold)"
                        : needsBorder(c)
                          ? "1.5px solid rgba(0,0,0,0.15)"
                          : "1.5px solid rgba(0,0,0,0.1)",
                      outline: i === activeColor ? "1.5px solid rgba(192,168,130,0.45)" : "none",
                      outlineOffset: "1px",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <p
          className="leading-snug line-clamp-1 font-semibold"
          style={{ fontSize: "clamp(11px, 3vw, 13px)", color: "var(--text-primary)" }}
        >
          {item.name}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Stars rating={item.rating} />
            <span style={{ fontSize: "clamp(9px, 2.5vw, 10.5px)", color: "var(--text-brand)", fontWeight: 700 }}>
              {item.rating}
            </span>
          </div>
          <span style={{ fontSize: "clamp(8.5px, 2.3vw, 10px)", color: "var(--text-muted)" }}>
            {formatSales(item.sales)} مبيعة
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold" style={{ fontSize: "clamp(13px, 3.6vw, 15px)", color: "var(--text-price)" }}>
              {item.price.toLocaleString("ar-SA")}
            </span>
            <span style={{ fontSize: "clamp(9px, 2.5vw, 10.5px)", color: "var(--text-secondary)" }}>ر.س</span>
          </div>
          <span className="line-through" style={{ fontSize: "clamp(9px, 2.5vw, 10.5px)", color: "var(--text-muted)" }}>
            {item.original_price.toLocaleString("ar-SA")}
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <span
            className="rounded-full px-2 py-0.5 leading-none font-bold"
            style={{ fontSize: "clamp(9px, 2.5vw, 10.5px)", background: "var(--discount-bg)", color: "var(--discount-text)" }}
          >
            خصم {item.discount}%
          </span>
          <CartButton size="md" product={item} selectedColor={selectedColor} />
        </div>
      </div>
    </article>
  );
}
