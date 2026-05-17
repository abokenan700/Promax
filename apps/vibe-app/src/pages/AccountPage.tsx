import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  User, ShoppingBag, Heart, MapPin, CreditCard,
  Bell, HelpCircle, LogOut, ChevronRight, Star, Gift, Trophy, TrendingDown, AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { apiFetch } from "../lib/apiFetch";
import { useAccountSheet } from "../context/AccountSheetContext";

/* ── LogoutConfirmDialog ─────────────────────────────────────────── */
function LogoutConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <div
        aria-hidden="true"
        onClick={onCancel}
        style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        aria-describedby="logout-desc"
        dir="rtl"
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 301,
          width: "calc(100% - 40px)", maxWidth: 340,
          background: "var(--bg-card)",
          borderRadius: 22,
          padding: "28px 22px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.30)",
          textAlign: "center",
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "#FEF0EE",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <AlertTriangle size={26} color="var(--error)" />
        </div>
        <p
          id="logout-title"
          style={{ fontFamily: "var(--font-main)", fontSize: 17, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px" }}
        >
          تسجيل الخروج؟
        </p>
        <p
          id="logout-desc"
          style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 24px", lineHeight: 1.6, fontFamily: "var(--font-main)" }}
        >
          سيتم تسجيل خروجك من حسابك وإزالة بيانات الجلسة من هذا الجهاز
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "13px 0", borderRadius: 14,
              border: "1.5px solid var(--border-warm)",
              background: "var(--gold-pale)",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "13px 0", borderRadius: 14,
              border: "none",
              background: "var(--error)",
              color: "#fff",
              fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700,
              cursor: "pointer",
            }}
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </>
  );
}

/* ── MenuItem ────────────────────────────────────────────────────── */
interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  sub?: string;
  danger?: boolean;
  badge?: string | number;
  noBottomBorder?: boolean;
  onClick?: () => void;
}

function MenuItem({ icon: Icon, label, sub, danger, badge, noBottomBorder, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors active:opacity-60"
      style={{ borderBottom: noBottomBorder ? "none" : "1px solid var(--border)" }}
      dir="rtl"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: danger ? "#FEF0EE" : "var(--gold-light)" }}
      >
        <Icon size={17} style={{ color: danger ? "var(--error)" : "var(--text-brand)" }} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold leading-tight" style={{ fontSize: "var(--text-sm)", color: danger ? "var(--error)" : "var(--text-primary)" }}>
          {label}
        </p>
        {sub && (
          <p className="leading-tight mt-0.5" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{sub}</p>
        )}
      </div>
      {badge !== undefined && badge !== 0 && (
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--gold-light)", color: "var(--text-brand)", flexShrink: 0 }}>
          {badge}
        </span>
      )}
      <ChevronRight size={14} style={{ color: "var(--text-muted)", flexShrink: 0, transform: "scaleX(-1)" }} />
    </button>
  );
}

/* ── LoyaltyCard ─────────────────────────────────────────────────── */
function LoyaltyCard({ points }: { points: number }) {
  const level     = points >= 5000 ? "بلاتيني" : points >= 2000 ? "ذهبي" : points >= 500 ? "فضي" : "عضو";
  const nextLevel = points < 500 ? 500 : points < 2000 ? 2000 : points < 5000 ? 5000 : null;
  const pct       = nextLevel ? Math.min(100, (points / nextLevel) * 100) : 100;
  const levelColors: Record<string, string> = {
    "بلاتيني": "#A0A0A8",
    "ذهبي":    "#FFD700",
    "فضي":     "#C0C0C0",
    "عضو":     "var(--gold)",
  };

  return (
    <div
      aria-label={`بطاقة ولاء نخبة — المستوى ${level} — ${points.toLocaleString("ar-SA")} نقطة`}
      dir="rtl"
      style={{
        margin: "12px 12px 0",
        borderRadius: "var(--radius-card)",
        background: "linear-gradient(135deg,#1E1C1A 0%,#2E2A24 100%)",
        padding: "16px",
        border: "1px solid rgba(192,168,130,0.3)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <Trophy size={14} style={{ color: levelColors[level] }} aria-hidden="true" />
            <span style={{ fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 700, color: levelColors[level] }}>{level}</span>
          </div>
          <p style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>نقاط نخبة</p>
        </div>
        <div style={{ textAlign: "end" }}>
          <span style={{ fontFamily: "var(--font-main)", fontSize: 26, fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>
            {points.toLocaleString("ar-SA")}
          </span>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>نقطة</p>
        </div>
      </div>

      {nextLevel && (
        <>
          <div
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`التقدم نحو المستوى التالي: ${Math.round(pct)}%`}
            style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: 5 }}
          >
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: "linear-gradient(90deg,var(--gold),var(--gold-accent))", transition: "width 0.6s" }} />
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            {(nextLevel - points).toLocaleString("ar-SA")} نقطة حتى المستوى التالي
          </p>
        </>
      )}
    </div>
  );
}

/* ── AccountSkeleton ─────────────────────────────────────────────── */
function AccountSkeleton() {
  return (
    <div className="mx-3 mt-4 flex flex-col gap-3 animate-pulse" aria-busy="true" aria-label="جارٍ تحميل بيانات الحساب">
      <div style={{ borderRadius: "var(--radius-card)", background: "var(--bg-card)", border: "1px solid var(--border)", padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--border-warm)", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 14, width: "55%", borderRadius: 6, background: "var(--border-warm)" }} />
          <div style={{ height: 10, width: "75%", borderRadius: 6, background: "var(--border)" }} />
        </div>
      </div>
      <div style={{ borderRadius: "var(--radius-card)", height: 100, background: "var(--bg-card)", border: "1px solid var(--border)" }} />
      <div style={{ borderRadius: "var(--radius-card)", height: 200, background: "var(--bg-card)", border: "1px solid var(--border)" }} />
    </div>
  );
}

/* ── AccountPage ─────────────────────────────────────────────────── */
export function AccountPage() {
  const [, navigate]              = useLocation();
  const { user, logout, loading } = useAuth();
  const { wishlist }              = useWishlist();
  const { openSheet }             = useAccountSheet();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { data: pointsData } = useQuery<{ points: number }>({
    queryKey:  ["user-points"],
    queryFn:   () => apiFetch<{ points: number }>("/api/v1/users/me/points", { auth: true }),
    enabled:   !!user,
    staleTime: 5 * 60_000,
  });
  const livePoints = pointsData?.points ?? 0;

  const { data: notifications = [] } = useQuery<{ id: number; read: string }[]>({
    queryKey:  ["notifications"],
    queryFn:   () => apiFetch<{ id: number; read: string }[]>("/api/v1/notifications", { auth: true }),
    enabled:   !!user,
    staleTime: 2 * 60_000,
  });
  const unreadCount = notifications.filter(n => n.read !== "true").length;

  const { data: priceAlerts = [] } = useQuery<{ id: number }[]>({
    queryKey:  ["price-alerts"],
    queryFn:   () => apiFetch<{ id: number }[]>("/api/v1/price-alerts", { auth: true }),
    enabled:   !!user,
    staleTime: 60_000,
  });

  const { data: orders = [] } = useQuery<{ id: number }[]>({
    queryKey:  ["orders"],
    queryFn:   () => apiFetch<{ id: number }[]>("/api/v1/orders", { auth: true }),
    enabled:   !!user,
    staleTime: 2 * 60_000,
  });
  const ordersCount = orders.length;

  function handleLogoutConfirm() {
    setShowLogoutConfirm(false);
    logout();
    toast("تم تسجيل الخروج بنجاح", { icon: "👋" });
    navigate("/");
  }

  function handleComingSoon(label: string) {
    toast(`${label} — قريباً`, { icon: "🔧" });
  }

  return (
    <>
      {showLogoutConfirm && (
        <LogoutConfirmDialog
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: "var(--nav-h)" }}>

        {/* Page header */}
        <div className="px-4 pt-4 pb-5" style={{ flexShrink: 0, borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <h1
            className="font-bold"
            style={{
              fontSize: "17px", margin: 0,
              background: "linear-gradient(90deg, #F0D898 0%, #C8A060 40%, #F0D898 70%, #D4B870 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >حسابي</h1>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar">

          {/* ── Loading ── */}
          {loading ? <AccountSkeleton /> : !user ? (

            /* ── Guest State ── */
            <div className="mx-3 mt-4">
              <div
                className="rounded-2xl p-5 flex flex-col items-center gap-3"
                style={{ background: "linear-gradient(135deg,var(--gold-pale),var(--gold-light))", border: "1px solid var(--border-warm)" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-accent))" }}
                >
                  <User size={30} color="#fff" strokeWidth={1.8} />
                </div>
                <p style={{ fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", textAlign: "center" }}>
                  سجّل دخولك إلى نخبة
                </p>
                <p style={{ fontFamily: "var(--font-main)", fontSize: 12.5, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>
                  احتفظ بمفضلتك وسلّتك ونقاط الولاء في أي جهاز
                </p>

                <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 4 }}>
                  {[
                    { icon: "🛍️", text: "تتبع طلباتك في الوقت الفعلي" },
                    { icon: "💎", text: "اكسب نقاط مع كل عملية شراء" },
                    { icon: "🔔", text: "تنبيهات انخفاض الأسعار" },
                  ].map(({ icon, text }) => (
                    <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15 }}>{icon}</span>
                      <span style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "var(--text-secondary)" }}>{text}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => openSheet()}
                  aria-label="تسجيل الدخول أو إنشاء حساب جديد"
                  style={{
                    padding: "13px 28px", borderRadius: 14, border: "none",
                    background: "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)",
                    color: "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", marginTop: 4,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.20)",
                  }}
                >
                  دخول / إنشاء حساب
                </button>
              </div>
            </div>

          ) : (

            /* ── Authenticated State ── */
            <>
              {/* Profile card */}
              <div
                className="mx-3 mt-4 rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "linear-gradient(135deg,var(--gold-pale),var(--gold-light))", border: "1px solid var(--border-warm)" }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-accent))", border: "2px solid rgba(192,168,130,0.4)", overflow: "hidden" }}
                >
                  {user.avatar
                    ? <img src={user.avatar} alt="صورة الملف الشخصي" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <User size={26} color="#fff" strokeWidth={1.8} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate" title={user.name} style={{ fontSize: "var(--text-lg)", color: "var(--text-primary)" }}>
                    {user.name}
                  </p>
                  <p className="truncate" style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                    {user.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="fill-yellow-400 stroke-yellow-400" aria-hidden="true" />
                    <span style={{ fontSize: "var(--text-2xs)", color: "var(--text-brand)", fontWeight: 700 }}>عضو نخبة</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/edit-profile")}
                  aria-label="تعديل الملف الشخصي"
                  className="px-3 py-1.5 rounded-xl font-semibold flex-shrink-0"
                  style={{ background: "var(--text-brand)", color: "#fff", fontSize: "11px" }}
                >
                  تعديل
                </button>
              </div>

              {/* Loyalty card */}
              <LoyaltyCard points={livePoints} />

              {/* Stats grid — responsive for small screens */}
              <div className="mx-3 mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "طلباتي",  value: String(ordersCount),                action: () => navigate("/orders") },
                  { label: "المفضلة", value: String(wishlist.length),             action: () => navigate("/wishlist") },
                  { label: "نقاطي",   value: livePoints.toLocaleString("ar-SA"), action: () => navigate("/price-alerts") },
                ].map(({ label, value, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    aria-label={`${label}: ${value}`}
                    className="rounded-xl py-3 flex flex-col items-center gap-1 transition-opacity active:opacity-60 min-w-0"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    <span
                      className="font-bold w-full text-center truncate px-1"
                      style={{ fontSize: "clamp(14px, 4vw, var(--text-xl))", color: "var(--text-brand)" }}
                    >
                      {value}
                    </span>
                    <span style={{ fontSize: "var(--text-2xs)", color: "var(--text-secondary)" }}>{label}</span>
                  </button>
                ))}
              </div>

              {/* Menu */}
              <div className="mx-3 mt-3 rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <MenuItem icon={ShoppingBag}  label="طلباتي"              sub={ordersCount ? `${ordersCount} طلب` : undefined}             badge={ordersCount || undefined}                               onClick={() => navigate("/orders")} />
                <MenuItem icon={Heart}        label="المفضلة"                                                                               badge={wishlist.length || undefined}                           onClick={() => navigate("/wishlist")} />
                <MenuItem icon={Gift}         label="نقاط نخبة ومكافآتي"  sub={`${livePoints.toLocaleString("ar-SA")} نقطة`}                                                                              onClick={() => navigate("/price-alerts")} />
                <MenuItem icon={MapPin}       label="عناويني"              sub="إدارة عناوين التوصيل"                                                                                                    onClick={() => navigate("/addresses")} />
                <MenuItem icon={CreditCard}   label="طرق الدفع"                                                                                                                                           onClick={() => handleComingSoon("طرق الدفع")} />
                <MenuItem icon={TrendingDown} label="تنبيهات الأسعار"     sub="المنتجات التي تتابعها"                                       badge={priceAlerts.length || undefined}                        onClick={() => navigate("/price-alerts")} />
                <MenuItem icon={Bell}         label="الإشعارات"                                                                             badge={unreadCount > 0 ? (unreadCount > 99 ? "99+" : String(unreadCount)) : undefined} onClick={() => navigate("/notifications")} />
                <MenuItem icon={HelpCircle}   label="الدعم والمساعدة"     noBottomBorder                                                                                                                  onClick={() => handleComingSoon("الدعم والمساعدة")} />
              </div>

              {/* Logout */}
              <div className="mx-3 mt-2.5 mb-4 rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <MenuItem
                  icon={LogOut}
                  label="تسجيل الخروج"
                  danger
                  noBottomBorder
                  onClick={() => setShowLogoutConfirm(true)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
