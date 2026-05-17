const categories = [
  { label: "جديدنا", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80&fm=webp" },
  { label: "ملابس",  img: "https://lgxyozslosrorvwicvdx.supabase.co/storage/v1/object/public/categories/clothes.png" },
  { label: "أحذية",  img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80&fm=webp" },
  { label: "عطور",   img: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=300&q=80&fm=webp" },
  { label: "مجوهرات",img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80&fm=webp" },
];

export function V1() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, fontFamily: "sans-serif", direction: "rtl" }}>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>خيار ١ — ذهبي كلاسيك ناعم</p>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {categories.map((cat, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            {/* الإطار: border ثابت ذهبي بسيط */}
            <div style={{
              width: 62, height: 62, borderRadius: "50%", padding: 2,
              background: i === 0
                ? "linear-gradient(135deg, #C9A84C, #7A5200, #C0A882)"
                : "linear-gradient(135deg, #C9A84C 0%, #8B6310 50%, #C0A882 100%)",
              boxShadow: i === 0 ? "0 0 10px rgba(184,146,42,0.5)" : "none",
            }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#fafaf9" }}>
                <img src={cat.img} alt={cat.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
            <span style={{ fontSize: 11, color: i === 0 ? "#8B6310" : "#444", fontWeight: i === 0 ? 700 : 400 }}>{cat.label}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>سُمك 2px • gradient ذهبي كلاسيك</p>
    </div>
  );
}
