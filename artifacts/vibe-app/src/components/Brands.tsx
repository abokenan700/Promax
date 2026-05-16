import { useState } from "react";
import { useGetBrands } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { SectionHeader } from "./SectionHeader";

const BRAND_SLOT_COUNT = 5;

export function Brands() {
  const { data: brands = [], isLoading } = useGetBrands();
  const [, navigate] = useLocation();
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  function handleImgError(id: string) {
    setFailedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  return (
    <div className="px-3 pt-1 pb-4">
      <SectionHeader
        title="الماركات المميزة"
        onViewAll={() => navigate("/search")}
      />

      <div className="flex items-center justify-between gap-1.5">
        {isLoading
          ? Array.from({ length: BRAND_SLOT_COUNT }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-xl skeleton"
                style={{
                  height: "clamp(34px, 9vw, 44px)",
                  border: "1px solid var(--border)",
                }}
              />
            ))
          : brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => navigate(`/search?brand=${encodeURIComponent(brand.label)}`)}
                className="flex-1 rounded-xl flex items-center justify-center transition-[transform,opacity,box-shadow] active:scale-95 active:opacity-70"
                style={{
                  height: "clamp(34px, 9vw, 44px)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                  cursor: "pointer",
                }}
                aria-label={`تصفح منتجات ${brand.label}`}
              >
                {brand.icon && !failedIds.has(brand.id) ? (
                  <img
                    src={brand.icon}
                    alt={brand.label}
                    loading="lazy"
                    className="object-contain"
                    style={{ maxHeight: "clamp(16px, 5vw, 22px)", maxWidth: "clamp(32px, 10vw, 48px)" }}
                    onError={() => handleImgError(brand.id)}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: "var(--font-main)",
                      fontSize: "clamp(9px, 2.8vw, 12px)",
                      fontWeight: 700,
                      letterSpacing: "1.8px",
                      color: "var(--text-primary)",
                    }}
                  >
                    {brand.label}
                  </span>
                )}
              </button>
            ))}
      </div>
    </div>
  );
}
