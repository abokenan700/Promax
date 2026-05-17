import logoCoin from "/logo-coin-orig.png";
import { Bell, User } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useAccountSheet } from "../context/AccountSheetContext";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "صباح الخير";
  if (h >= 12 && h < 17) return "مساء الخير";
  if (h >= 17 && h < 21) return "مساء النور";
  return "مرحباً";
}

export function Header() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { openSheet } = useAccountSheet();
  const greeting = getGreeting();

  return (
    <header className="flex items-center justify-between px-4 pt-2 pb-1" style={{ background: "var(--bg-card)" }}>
      {/* Logo + Brand */}
      <div className="flex items-center gap-1">
        <img
          src={logoCoin}
          alt="نخبة"
          className="w-14 h-14 object-cover flex-shrink-0 rounded-full"
          decoding="async"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <span style={{ fontFamily: "var(--font-main)", background: "var(--gradient-brand-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontSize: "24px", fontWeight: 900, letterSpacing: "4px", lineHeight: 1.15, marginTop: "4px" }}>
            نخبة
          </span>
          {user && (
            <span style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1, marginTop: 1 }}>
              {greeting}، {user.name.split(" ")[0]}
            </span>
          )}
          {!user && (
            <span style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1, marginTop: 1 }}>
              {greeting} 👋
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        {/* Notification bell */}
        <button
          className="flex items-center justify-center rounded-full transition-colors"
          style={{ width: 44, height: 44, position: "relative" }}
          aria-label="الإشعارات"
          onClick={() => navigate("/notifications")}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold-pale)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          <Bell size={20} strokeWidth={1.6} color="var(--gold)" />
          <span style={{ position: "absolute", top: 4, insetInlineEnd: 4, width: 8, height: 8, borderRadius: "50%", background: "#E04545", border: "1.5px solid var(--bg-card)" }} />
        </button>

        <button
          className="flex items-center justify-center rounded-full transition-colors"
          style={{ width: 44, height: 44 }}
          aria-label="الحساب"
          onClick={() => user ? navigate("/account") : openSheet()}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold-pale)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          <User size={20} strokeWidth={1.6} color="var(--gold)" />
        </button>
      </div>
    </header>
  );
}
