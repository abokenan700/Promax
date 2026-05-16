import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

interface Collection {
  title: string;
  subtitle: string;
  image: string;
  query: string;
  gradient: string;
  textColor: string;
  btnBg: string;
  btnText: string;
}

const COLLECTIONS: Collection[] = [
  {
    title: "كولكشن الصيف ٢٠٢٦",
    subtitle: "أحدث صيحات الموضة الفاخرة",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85&fm=webp",
    query: "ملابس",
    gradient: "linear-gradient(90deg,rgba(30,28,26,0.85) 0%,rgba(30,28,26,0.3) 100%)",
    textColor: "#fff",
    btnBg: "rgba(255,255,255,0.15)",
    btnText: "#fff",
  },
  {
    title: "عالم العطور الفاخرة",
    subtitle: "روائح تتركك أثراً لا ينسى",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=85&fm=webp",
    query: "عطور",
    gradient: "linear-gradient(90deg,rgba(139,99,16,0.9) 0%,rgba(192,168,130,0.4) 100%)",
    textColor: "#fff",
    btnBg: "rgba(255,255,255,0.2)",
    btnText: "#fff",
  },
];

export function CollectionBanners() {
  const [, navigate] = useLocation();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 12px 12px" }}>
      {COLLECTIONS.map((c) => (
        <button key={c.title}
          style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", height: 150, cursor: "pointer", display: "block", width: "100%", padding: 0, border: "none" }}
          onClick={() => navigate(`/search?q=${encodeURIComponent(c.query)}`)}
          aria-label={c.title}>

          {/* Background image */}
          <img src={c.image} alt={c.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.background = "var(--card-img-bg)"; e.currentTarget.style.opacity = "0"; }} />

          {/* Gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: c.gradient }} />

          {/* Content */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 20px" }} dir="rtl">
            <p style={{ fontFamily: "var(--font-main)", fontSize: 17, fontWeight: 800, color: c.textColor, lineHeight: 1.2, marginBottom: 5, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
              {c.title}
            </p>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 12, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
              {c.subtitle}
            </p>
            <div style={{ display: "flex" }}>
              <span
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", minHeight: 44, borderRadius: 20, background: c.btnBg, border: "1px solid rgba(255,255,255,0.3)", color: c.btnText, fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 700, backdropFilter: "blur(4px)" }}>
                تسوق الآن
                <ArrowLeft size={13} />
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
