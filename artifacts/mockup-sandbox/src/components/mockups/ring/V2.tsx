const categories = [
  { label: "جديدنا", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80&fm=webp" },
  { label: "ملابس",  img: "https://lgxyozslosrorvwicvdx.supabase.co/storage/v1/object/public/categories/clothes.png" },
  { label: "أحذية",  img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80&fm=webp" },
  { label: "عطور",   img: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=300&q=80&fm=webp" },
  { label: "مجوهرات",img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80&fm=webp" },
];

export function V2() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, fontFamily: "sans-serif", direction: "rtl" }}>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>خيار ٢ — ذهبي داكن نحيف جداً</p>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {categories.map((cat, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            {/* outline نحيف جداً 1.5px */}
            <div style={{
              width: 62, height: 62, borderRadius: "50%",
              outline: i === 0
                ? "2px solid #8B6310"
                : "1.5px solid #A0720A",
              outlineOffset: i === 0 ? 2 : 1.5,
              boxShadow: i === 0 ? "0 0 0 4px rgba(139,99,16,0.12)" : "none",
            }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#fafaf9" }}>
                <img src={cat.img} alt={cat.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
            <span style={{ fontSize: 11, color: i === 0 ? "#8B6310" : "#444", fontWeight: i === 0 ? 700 : 400 }}>{cat.label}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>outline 1.5px • ذهبي داكن #A0720A • مسافة خارج الصورة</p>
    </div>
  );
}
