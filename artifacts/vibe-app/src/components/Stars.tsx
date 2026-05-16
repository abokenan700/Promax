import { Star } from "lucide-react";

export function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} strokeWidth={1.4} style={{
          fill: i <= full ? "var(--gold)" : i === full + 1 && half ? "rgba(192,168,130,0.55)" : "none",
          stroke: i <= full || (i === full + 1 && half) ? "var(--gold)" : "#D4CFC9",
        }} />
      ))}
    </div>
  );
}
