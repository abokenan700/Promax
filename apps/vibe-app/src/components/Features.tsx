import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

interface Feature {
  Icon: React.ElementType;
  color: string;
  title: string;
  sub: string;
}

const features: Feature[] = [
  { Icon: Truck,        color: "var(--text-brand)", title: "توصيل سريع",   sub: "خلال 24 ساعة" },
  { Icon: ShieldCheck,  color: "var(--text-brand)", title: "منتجات أصلية", sub: "100% مضمونة"   },
  { Icon: RotateCcw,    color: "var(--text-brand)", title: "إرجاع مجاني",  sub: "حتى 15 يوم"   },
];

export function Features() {
  return (
    <div className="px-3 py-2">
      <div
        className="rounded-2xl px-2 py-3 flex items-center justify-between"
        style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-feature)" }}
      >
        {features.map((f, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 relative">
            {i < features.length - 1 && (
              <div className="absolute end-0 top-1/2 -translate-y-1/2 w-px h-7" style={{ background: "var(--border)" }} />
            )}
            <div className="flex items-center gap-1">
              <f.Icon
                size={16}
                strokeWidth={1.8}
                style={{ color: f.color, flexShrink: 0 }}
              />
              <span className="font-medium" style={{ fontSize: "clamp(10px, 3vw, 12px)", color: "var(--text-primary)" }}>
                {f.title}
              </span>
            </div>
            <span style={{ fontSize: "clamp(9px, 2.5vw, 10.5px)", color: "var(--text-muted)" }}>
              {f.sub}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
