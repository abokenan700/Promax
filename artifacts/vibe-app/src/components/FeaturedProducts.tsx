/**
 * مشكلة 32: حُذف تعريف ProductCard المحلي — أُنقل إلى FeaturedCard.tsx
 */
import { useGetProducts } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { SectionHeader } from "./SectionHeader";
import { FeaturedCard } from "./FeaturedCard";

export function FeaturedProducts() {
  const { data: products = [], isLoading } = useGetProducts();
  const [, navigate] = useLocation();

  return (
    <div className="px-3 pt-1 pb-3">
      <SectionHeader
        title="منتجات مميزة"
        onViewAll={() => navigate("/categories")}
      />
      <div className="grid grid-cols-2 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden animate-pulse"
                style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
              >
                <div style={{ aspectRatio: "1", background: "var(--border)" }} />
                <div className="p-3 flex flex-col gap-2">
                  <div className="h-2.5 rounded-full" style={{ width: "55%", background: "var(--border)" }} />
                  <div className="h-3 rounded-full" style={{ width: "80%", background: "var(--border)" }} />
                  <div className="h-2 rounded-full" style={{ width: "40%", background: "var(--border)" }} />
                  <div className="h-7 rounded-xl mt-1" style={{ background: "var(--border)" }} />
                </div>
              </div>
            ))
          : products.map((item) => (
              <FeaturedCard key={item.id} item={item} />
            ))}
      </div>
    </div>
  );
}
