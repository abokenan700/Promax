/**
 * مشكلة 32: حُذف تعريف ProductCard المحلي — أُنقل إلى DealCard.tsx
 * مشكلة 144: حُذف useCountdown المحلي — أُنقل إلى hooks/useCountdown.ts
 * مشكلة 127: CountdownDisplay مكوّن منفصل → هو الوحيد الذي يُعاد رسمه كل ثانية
 *            بدلاً من Products بأكملها (DealCards + queries + ...)
 */
import { memo } from "react";
import { useGetProducts } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { SectionHeader } from "./SectionHeader";
import { DealCard } from "./DealCard";
import { useCountdown } from "../hooks/useCountdown";

const DEALS_SESSION_KEY = "nakhba_deals_end_ms";

function getDealEndMs(): number {
  try {
    const stored = sessionStorage.getItem(DEALS_SESSION_KEY);
    if (stored) return Number(stored);
    const end = Date.now() + (2 * 3600 + 18 * 60 + 43) * 1000;
    sessionStorage.setItem(DEALS_SESSION_KEY, String(end));
    return end;
  } catch {
    return Date.now() + (2 * 3600 + 18 * 60 + 43) * 1000;
  }
}

const DAILY_DEALS_END_MS = getDealEndMs();

const CountdownDisplay = memo(function CountdownDisplay() {
  const countdown = useCountdown(DAILY_DEALS_END_MS);
  return (
    <div
      className="border rounded-[4px] px-2 py-0.5"
      style={{ background: "#F1E5D9", borderColor: "#F5ECE3" }}
    >
      <span
        className="text-[#5D5854] font-medium tabular-nums"
        style={{ fontSize: "clamp(9px, 2.8vw, 11px)" }}
      >
        {countdown}
      </span>
    </div>
  );
});

export function Products() {
  const { data: products = [], isLoading } = useGetProducts();
  const [, navigate] = useLocation();

  return (
    <div className="px-3 py-2">
      <SectionHeader
        title="عروض اليوم"
        extra={<CountdownDisplay />}
        onViewAll={() => navigate("/categories")}
      />

      <div className="overflow-x-auto pb-1 hide-scrollbar -mx-3" dir="rtl">
        <div className="flex gap-2.5 px-3" style={{ width: "max-content" }}>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 rounded-2xl overflow-hidden animate-pulse"
                  style={{ width: "clamp(112px, 30vw, 138px)", background: "var(--card-bg)", border: "1px solid var(--gold)" }}
                >
                  <div style={{ aspectRatio: "1 / 0.95", background: "#EDE8E2" }} />
                  <div style={{ height: 1, background: "var(--gold)", opacity: 0.25 }} />
                  <div className="px-2 pt-1.5 pb-2 flex flex-col gap-1.5">
                    <div className="rounded" style={{ height: 8, width: "48%", background: "#DDD8CF" }} />
                    <div className="rounded" style={{ height: 10, width: "84%", background: "#DDD8CF" }} />
                    <div className="flex items-center justify-between">
                      <div className="rounded" style={{ height: 12, width: "44%", background: "#DDD8CF" }} />
                      <div className="rounded" style={{ height: 8, width: "28%", background: "#DDD8CF" }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-full" style={{ height: 18, width: "44%", background: "#DDD8CF" }} />
                      <div className="rounded-full" style={{ height: 22, width: 22, background: "#DDD8CF" }} />
                    </div>
                  </div>
                </div>
              ))
            : products.map((p) => (
                <DealCard key={p.id} product={p} />
              ))}
        </div>
      </div>
    </div>
  );
}
