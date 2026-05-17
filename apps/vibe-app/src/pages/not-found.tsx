import { useLocation } from "wouter";
import { SearchX } from "lucide-react";

/* ── مشكلة 43: صفحة 404 كانت كلها بالإنجليزية في تطبيق عربي بالكامل ── */
/* ── مشكلة 44: صفحة 404 غير مُوجَّهة — تمت إضافتها كـ Route في App.tsx ── */
export function NotFoundPage() {
  const [, navigate] = useLocation();

  return (
    <div
      style={{
        flex: "1 1 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "40px 32px",
        background: "var(--bg-page)",
        textAlign: "center",
        paddingBottom: "calc(var(--nav-h) + 40px)",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "var(--gold-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SearchX size={36} strokeWidth={1.4} style={{ color: "var(--text-brand)" }} />
      </div>

      <p
        style={{
          fontFamily: "var(--font-main)",
          fontSize: 64,
          fontWeight: 800,
          color: "#E8E3DC",
          lineHeight: 1,
          marginBottom: -8,
        }}
      >
        ٤٠٤
      </p>

      <h1
        style={{
          fontFamily: "var(--font-main)",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text-primary)",
        }}
      >
        الصفحة غير موجودة
      </h1>

      <p
        style={{
          fontFamily: "var(--font-main)",
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.7,
          maxWidth: 260,
        }}
      >
        يبدو أن هذه الصفحة لم تعد موجودة أو أن الرابط غير صحيح.
      </p>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: 8,
          padding: "14px 32px",
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(135deg, var(--gold), var(--gold-accent))",
          color: "#fff",
          fontFamily: "var(--font-main)",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        العودة للرئيسية
      </button>
    </div>
  );
}

export default NotFoundPage;
