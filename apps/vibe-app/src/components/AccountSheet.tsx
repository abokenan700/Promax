import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  X, ArrowRight, Mail, Lock, Eye, EyeOff,
  Loader, User, CheckCircle2, ShieldCheck,
} from "lucide-react";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { useAccountSheet } from "../context/AccountSheetContext";
import { friendlyError } from "../lib/errors";
import { Input } from "./ui/Input";
import { OTPInput } from "./ui/OTPInput";
import { PasswordStrength } from "./ui/PasswordStrength";

type Mode = "login" | "register" | "forgot";

const REMEMBER_KEY = "nakhba_remember";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح — تأكد من الصيغة مثل: name@email.com"),
  pass:  z.string().min(1, "كلمة المرور مطلوبة"),
});

const registerSchema = z.object({
  name:        z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email:       z.string().email("البريد الإلكتروني غير صحيح — تأكد من الصيغة مثل: name@email.com"),
  pass:        z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPass: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine(d => d.pass === d.confirmPass, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPass"],
});

/* ─────────────────────────────────────────────────────────────────
   Social SVG icons — crisp at small sizes
───────────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M44.5 20H24v8.5h11.8C34.6 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.2 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l7 5.1C15.1 16 19.2 13 24 13c3.1 0 6 1.1 8.2 3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.6 7.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.9 14.1-5l-6.5-5.5C29.6 36.1 26.9 37 24 37c-6.1 0-10.5-3.9-12-9.3l-7 5.4C8.5 40.7 15.7 45 24 45z"/>
      <path fill="#1976D2" d="M44.5 20H24v8.5h11.8c-.8 2.7-2.6 5-5 6.5l6.5 5.5C41.2 36.7 45 30.8 45 24c0-1.3-.2-2.7-.5-4z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32">
      <path fill="#1877F2" d="M32 16C32 7.163 24.837 0 16 0S0 7.163 0 16c0 7.984 5.85 14.606 13.5 15.806V20.625H9.438V16H13.5v-3.525c0-4.01 2.389-6.225 6.043-6.225 1.751 0 3.582.313 3.582.313v3.938h-2.019c-1.988 0-2.606 1.233-2.606 2.498V16h4.438l-.709 4.625H18.5v11.181C26.15 30.606 32 23.984 32 16z"/>
      <path fill="#fff" d="M22.229 20.625L22.938 16H18.5v-2.999c0-1.265.618-2.498 2.606-2.498h2.019V6.563s-1.831-.313-3.582-.313c-3.654 0-6.043 2.215-6.043 6.225V16H9.438v4.625H13.5v11.181a16.12 16.12 0 005 0V20.625h3.729z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 300 300">
      <path fill="currentColor" d="M178.57 127.15L290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59H300L178.57 127.15zm-36.26 41.26-11.87-16.62L36.44 19.42h40.64l76.24 106.73 11.87 16.62 99.06 138.63h-40.64l-81.3-113.99z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 814 1000">
      <path fill="currentColor" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.9 134.4-318 268.1-318 71.4 0 130.9 47.1 175.1 47.1 42.3 0 109-50 192.5-50 31 0 113.4 2.6 174.7 82.5zM549.8 148.8c23.7-28.1 40.8-67.5 40.8-106.9 0-5.1-.4-10.3-1.3-14.8-38.1 1.4-83.5 25.4-110.8 55.4-21.3 23.7-41 63.1-41 103.1 0 5.8.9 11.6 1.3 13.5 2.3.4 6.1.9 9.9.9 34.9 0 77.8-23.7 101.1-51.2z"/>
    </svg>
  );
}

/* Social provider config */
const SOCIAL = [
  {
    key:      "google",
    label:    "Google",
    icon:     <GoogleIcon />,
    bg:       "#fff",
    border:   "#E2E5EA",
    color:    "#3C4043",
    shadow:   "0 2px 8px rgba(0,0,0,0.10)",
    href:     "/api/v1/auth/google",
  },
  {
    key:      "facebook",
    label:    "Facebook",
    icon:     <FacebookIcon />,
    bg:       "#1877F2",
    border:   "#1877F2",
    color:    "#fff",
    shadow:   "0 2px 8px rgba(24,119,242,0.30)",
    href:     "/api/v1/auth/facebook",
  },
  {
    key:      "x",
    label:    "X",
    icon:     <XIcon />,
    bg:       "#000",
    border:   "#000",
    color:    "#fff",
    shadow:   "0 2px 8px rgba(0,0,0,0.22)",
    href:     null, // coming soon
  },
  {
    key:      "apple",
    label:    "Apple",
    icon:     <AppleIcon />,
    bg:       "#111",
    border:   "#111",
    color:    "#fff",
    shadow:   "0 2px 8px rgba(0,0,0,0.22)",
    href:     null, // coming soon
  },
] as const;

export function AccountSheet() {
  const { open, closeSheet } = useAccountSheet();
  const { login, register }  = useAuth();
  const [, navigate]         = useLocation();
  const dialogRef            = useRef<HTMLDivElement>(null);
  const firstRef             = useRef<HTMLInputElement>(null);

  const [mode, setMode]             = useState<Mode>("login");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [pass, setPass]             = useState("");
  const [confirmPass, setConfirm]   = useState("");
  const [show, setShow]             = useState(false);
  const [showConfirm, setShowConf]  = useState(false);
  const [busy, setBusy]             = useState(false);
  const [err, setErr]               = useState("");
  const [fieldErr, setFE]           = useState<Record<string, string>>({});
  const [remember, setRemember]     = useState(() => {
    try { return localStorage.getItem(REMEMBER_KEY) === "1"; } catch { return false; }
  });

  const [forgotEmail, setForgotEmail]   = useState("");
  const [otpSent, setOtpSent]           = useState(false);
  const [otp, setOtp]                   = useState("");
  const [otpError, setOtpError]         = useState(false);
  const [newPass, setNewPass]           = useState("");
  const [showNewPass, setShowNewPass]   = useState(false);
  const [devOtp, setDevOtp]             = useState<string | null>(null);
  const [resetOk, setResetOk]           = useState(false);
  const [countdown, setCountdown]       = useState(0);

  function resetAllState() {
    setName(""); setEmail(""); setPass(""); setConfirm("");
    setShow(false); setShowConf(false); setErr(""); setFE({});
    setForgotEmail(""); setOtpSent(false); setOtp("");
    setOtpError(false); setNewPass(""); setShowNewPass(false);
    setDevOtp(null); setResetOk(false); setCountdown(0);
  }

  useEffect(() => {
    if (!open) return;
    setMode("login");
    resetAllState();
    const t = setTimeout(() => firstRef.current?.focus(), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); closeSheet(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeSheet]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const el = dialogRef.current;
    const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () =>
      Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(n => n.offsetParent !== null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = getFocusable();
      if (!nodes.length) return;
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, mode]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function switchMode(m: Mode) { setMode(m); resetAllState(); }

  function validate(): boolean {
    const schema = mode === "login" ? loginSchema : registerSchema;
    const data   = mode === "login" ? { email, pass } : { name, email, pass, confirmPass };
    const res    = schema.safeParse(data);
    if (res.success) { setFE({}); return true; }
    const e: Record<string, string> = {};
    for (const i of res.error.issues) { const k = String(i.path[0]); if (!e[k]) e[k] = i.message; }
    setFE(e);
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setErr(""); setBusy(true);
    try {
      if (mode === "login") {
        await login(email.trim(), pass);
        try { remember ? localStorage.setItem(REMEMBER_KEY, "1") : localStorage.removeItem(REMEMBER_KEY); } catch { }
        toast("مرحباً بك في نخبة 👋");
      } else {
        await register(name.trim(), email.trim(), pass);
        toast("تم إنشاء حسابك بنجاح ✨");
      }
      closeSheet(); navigate("/account");
    } catch (ex) {
      setErr(friendlyError(ex instanceof Error ? ex.message : ""));
    } finally { setBusy(false); }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) { setErr("أدخل بريدك الإلكتروني"); return; }
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/v1/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail.trim() }) });
      const d = await r.json() as { otp?: string };
      setOtpSent(true); setCountdown(60);
      if (import.meta.env.DEV && d.otp) setDevOtp(d.otp);
      toast("تم إرسال رمز التحقق — تحقق من بريدك");
    } catch { setErr("تعذّر الاتصال بالخادم، تحقق من اتصالك بالإنترنت وحاول مجدداً"); }
    finally { setBusy(false); }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setBusy(true);
    try {
      const r = await fetch("/api/v1/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail.trim() }) });
      const d = await r.json() as { otp?: string };
      setCountdown(60); setOtp(""); setOtpError(false);
      if (import.meta.env.DEV && d.otp) setDevOtp(d.otp);
      toast("تم إعادة الإرسال — تحقق من بريدك");
    } catch { setErr("تعذّر الإرسال، حاول مجدداً"); }
    finally { setBusy(false); }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) { setOtpError(true); setErr("أدخل رمز التحقق كاملاً (6 أرقام)"); return; }
    if (!newPass || newPass.length < 6) { setErr("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"); return; }
    setErr(""); setOtpError(false); setBusy(true);
    try {
      const r = await fetch("/api/v1/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail, otp, newPassword: newPass }) });
      const d = await r.json() as { error?: string };
      if (!r.ok) { setOtpError(true); throw new Error(d.error ?? "الرمز غير صحيح"); }
      setResetOk(true); setDevOtp(null);
      try {
        await login(forgotEmail.trim(), newPass);
        toast.success("تم تغيير كلمة المرور وتسجيل الدخول تلقائياً");
        closeSheet(); navigate("/account");
      } catch {
        toast.success("تم تغيير كلمة المرور — يمكنك تسجيل الدخول الآن");
        setTimeout(() => switchMode("login"), 2000);
      }
    } catch (ex) { setErr(friendlyError(ex instanceof Error ? ex.message : "")); }
    finally { setBusy(false); }
  }

  /* ── Social login handler ── */
  function handleSocial(provider: typeof SOCIAL[number]) {
    if (!provider.href) {
      toast("سيتوفر قريباً — قيد التطوير");
      return;
    }
    closeSheet();
    window.location.href = provider.href;
  }

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeSheet}
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.42)",
          backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.26s ease",
        }}
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "تسجيل الدخول" : mode === "register" ? "إنشاء حساب" : "استعادة كلمة المرور"}
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: open ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(0.94)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          zIndex: 201,
          width: "calc(100% - 28px)",
          maxWidth: 420,
          maxHeight: "92dvh",
          background: "#FFFFFF",
          borderRadius: 24,
          boxShadow: "0 28px 72px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.055)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "transform 0.30s cubic-bezier(0.34,1.45,0.64,1), opacity 0.22s ease",
        }}
      >

        {/* ══════════════ LOGIN / REGISTER ══════════════ */}
        {(mode === "login" || mode === "register") && (
          <>
            {/* ── Header ── */}
            <div style={{
              padding: "26px 22px 22px",
              background: "#FAFAF9",
              borderBottom: "1px solid #EDEAE5",
              position: "relative",
              flexShrink: 0,
            }}>
              {/* Close */}
              <button
                onClick={closeSheet}
                aria-label="إغلاق"
                style={{
                  position: "absolute", top: 14, left: 14,
                  width: 30, height: 30, borderRadius: "50%",
                  border: "1px solid #E2DED8", background: "#fff",
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <X size={12} color="#7A756E" />
              </button>

              {/* Logo + title */}
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "linear-gradient(145deg,#D4AA70 0%,#9A7040 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px",
                  boxShadow: "0 4px 16px rgba(168,120,60,0.28)",
                }}>
                  <User size={22} color="#fff" strokeWidth={1.8} />
                </div>

                <h2 style={{ fontFamily: "var(--font-main)", fontSize: 19, fontWeight: 800, color: "#1A1814", margin: "0 0 4px", lineHeight: 1.2 }}>
                  {mode === "login" ? "أهلاً بك في نخبة" : "إنشاء حساب جديد"}
                </h2>
                <p style={{ fontFamily: "var(--font-main)", fontSize: 12.5, color: "#8A8480", margin: "0 0 18px" }}>
                  {mode === "login" ? "سجّل دخولك للوصول إلى حسابك" : "أنشئ حسابك وابدأ تجربة تسوق استثنائية"}
                </p>

                {/* ── Social icons row ── */}
                <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
                  {SOCIAL.map(s => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => handleSocial(s)}
                      aria-label={`تسجيل الدخول باستخدام ${s.label}`}
                      title={s.href ? `تسجيل الدخول باستخدام ${s.label}` : `${s.label} — قريباً`}
                      style={{
                        width: 46, height: 46,
                        borderRadius: "50%",
                        background: s.bg,
                        border: `1.5px solid ${s.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                        color: s.color,
                        boxShadow: s.shadow,
                        transition: "transform 0.18s ease, box-shadow 0.18s ease",
                        opacity: s.href ? 1 : 0.55,
                        position: "relative",
                      }}
                      onMouseEnter={e => {
                        if (!s.href) return;
                        const b = e.currentTarget;
                        b.style.transform = "translateY(-2px) scale(1.07)";
                        b.style.boxShadow = s.shadow.replace(/[\d.]+\)$/, "0.45)");
                      }}
                      onMouseLeave={e => {
                        const b = e.currentTarget;
                        b.style.transform = "";
                        b.style.boxShadow = s.shadow;
                      }}
                    >
                      {s.icon}
                      {/* "coming soon" micro-badge */}
                      {!s.href && (
                        <span style={{
                          position: "absolute", bottom: -1, right: -1,
                          width: 14, height: 14, borderRadius: "50%",
                          background: "#E8E4DE", border: "1.5px solid #fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 8, color: "#8A8480", fontWeight: 700,
                        }}>⋯</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Scrollable body ── */}
            <div dir="rtl" style={{ padding: "20px 22px 26px", overflowY: "auto", flex: "1 1 auto" }}>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: "#ECEAE6" }} />
                <span style={{ fontSize: 11.5, color: "#A09C96", fontFamily: "var(--font-main)", whiteSpace: "nowrap" }}>
                  أو {mode === "login" ? "الدخول" : "التسجيل"} بالبريد الإلكتروني
                </span>
                <div style={{ flex: 1, height: 1, background: "#ECEAE6" }} />
              </div>

              {/* Form */}
              <form onSubmit={e => { void handleSubmit(e); }} noValidate style={{ display: "flex", flexDirection: "column" }}>

                {mode === "register" && (
                  <>
                    <Input ref={firstRef} icon={<User size={17} color="#B8A88C" />} type="text" placeholder="الاسم الكامل" value={name} onChange={e => { setName(e.target.value); setFE(p => ({ ...p, name: "" })); }} autoComplete="name" required />
                    {fieldErr.name && <p role="alert" style={{ fontSize: 12, color: "var(--error)", margin: "-10px 0 10px", display: "flex", alignItems: "center", gap: 4 }}>⚠️ {fieldErr.name}</p>}
                  </>
                )}

                <Input
                  ref={mode === "login" ? firstRef : undefined}
                  icon={<Mail size={17} color="#B8A88C" />}
                  type="email" placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setFE(p => ({ ...p, email: "" })); setErr(""); }}
                  autoComplete="email" required
                />
                {fieldErr.email && <p role="alert" style={{ fontSize: 12, color: "var(--error)", margin: "-10px 0 10px", display: "flex", alignItems: "center", gap: 4 }}>⚠️ {fieldErr.email}</p>}

                <Input
                  icon={<Lock size={17} color="#B8A88C" />}
                  type={show ? "text" : "password"}
                  placeholder={mode === "register" ? "كلمة المرور (6 أحرف على الأقل)" : "كلمة المرور"}
                  value={pass}
                  onChange={e => { setPass(e.target.value); setFE(p => ({ ...p, pass: "" })); setErr(""); }}
                  autoComplete={mode === "login" ? "current-password" : "new-password"} required
                  suffix={
                    <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? "إخفاء" : "إظهار"} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex" }}>
                      {show ? <EyeOff size={16} color="var(--text-muted)" /> : <Eye size={16} color="var(--text-muted)" />}
                    </button>
                  }
                />
                {fieldErr.pass && <p role="alert" style={{ fontSize: 12, color: "var(--error)", margin: "-10px 0 10px", display: "flex", alignItems: "center", gap: 4 }}>⚠️ {fieldErr.pass}</p>}
                {mode === "register" && pass && <PasswordStrength password={pass} />}

                {mode === "register" && (
                  <>
                    <Input
                      icon={<Lock size={17} color="#B8A88C" />}
                      type={showConfirm ? "text" : "password"} placeholder="تأكيد كلمة المرور"
                      value={confirmPass}
                      onChange={e => { setConfirm(e.target.value); setFE(p => ({ ...p, confirmPass: "" })); setErr(""); }}
                      autoComplete="new-password" required
                      suffix={
                        <button type="button" onClick={() => setShowConf(s => !s)} aria-label={showConfirm ? "إخفاء" : "إظهار"} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex" }}>
                          {showConfirm ? <EyeOff size={16} color="var(--text-muted)" /> : <Eye size={16} color="var(--text-muted)" />}
                        </button>
                      }
                    />
                    {fieldErr.confirmPass && <p role="alert" style={{ fontSize: 12, color: "var(--error)", margin: "-10px 0 10px", display: "flex", alignItems: "center", gap: 4 }}>⚠️ {fieldErr.confirmPass}</p>}
                  </>
                )}

                {mode === "login" && (
                  <div dir="rtl" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, marginTop: 2 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                      <span style={{ position: "relative", width: 20, height: 20, flexShrink: 0 }}>
                        <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} aria-label="تذكّرني" style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", margin: 0, cursor: "pointer" }} />
                        <span aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 6, pointerEvents: "none", border: `2px solid ${remember ? "var(--gold)" : "#D1CBBC"}`, background: remember ? "var(--gold)" : "transparent", transition: "all 0.2s ease" }}>
                          {remember && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                        </span>
                      </span>
                      <span style={{ fontSize: 13, color: "#6B6560", fontFamily: "var(--font-main)" }}>تذكّرني</span>
                    </label>
                    <button type="button" onClick={() => switchMode("forgot")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-brand)", fontSize: 13, fontFamily: "var(--font-main)", padding: 0 }}>نسيت كلمة المرور؟</button>
                  </div>
                )}

                {err && (
                  <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "11px 13px", borderRadius: 11, background: "#FEF0EE", border: "1px solid #FECACA", marginBottom: 13 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                    <p style={{ fontSize: 13, color: "#DC2626", margin: 0, fontFamily: "var(--font-main)", lineHeight: 1.5 }}>{err}</p>
                  </div>
                )}

                <button
                  type="submit" disabled={busy}
                  style={{
                    width: "100%", padding: "14px 0", borderRadius: 13, border: "none",
                    background: busy ? "#C0B8AE" : "linear-gradient(135deg,#C8A060 0%,#8B6230 100%)",
                    color: "#fff", fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 700,
                    cursor: busy ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s ease",
                    boxShadow: busy ? "none" : "0 5px 18px rgba(168,120,60,0.32)",
                  }}
                >
                  {busy && <Loader size={16} className="animate-spin" />}
                  {mode === "login" ? "دخول إلى حسابي" : "إنشاء الحساب"}
                </button>
              </form>

              {/* Security badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 13, justifyContent: "center" }}>
                <ShieldCheck size={11} color="#B0AB A4" />
                <span style={{ fontSize: 11, color: "#A8A4A0", fontFamily: "var(--font-main)" }}>بياناتك محمية ومشفّرة</span>
              </div>

              {/* Switch mode */}
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #F0EDE8", textAlign: "center" }}>
                {mode === "login" ? (
                  <p style={{ margin: 0, fontSize: 13.5, color: "#6B6560", fontFamily: "var(--font-main)" }}>
                    ليس لديك حساب؟{" "}
                    <button type="button" onClick={() => switchMode("register")} style={{ background: "none", border: "none", cursor: "pointer", color: "#C8A060", fontWeight: 700, fontSize: 13.5, fontFamily: "var(--font-main)", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
                      أنشئ حساباً الآن
                    </button>
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: 13.5, color: "#6B6560", fontFamily: "var(--font-main)" }}>
                    لديك حساب بالفعل؟{" "}
                    <button type="button" onClick={() => switchMode("login")} style={{ background: "none", border: "none", cursor: "pointer", color: "#C8A060", fontWeight: 700, fontSize: 13.5, fontFamily: "var(--font-main)", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
                      سجّل الدخول
                    </button>
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ══════════════ FORGOT / RESET ══════════════ */}
        {mode === "forgot" && (
          <>
            <div dir="rtl" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 20px 15px", flexShrink: 0, borderBottom: "1px solid #EDEAE5", background: "#FAFAF9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => switchMode("login")} aria-label="رجوع" style={{ width: 33, height: 33, borderRadius: "50%", border: "1px solid #E2DED8", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <ArrowRight size={14} color="#6B6560" />
                </button>
                <div>
                  <h2 style={{ fontFamily: "var(--font-main)", fontSize: 17, fontWeight: 800, color: "#1A1814", margin: 0 }}>استعادة كلمة المرور</h2>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8A8480", fontFamily: "var(--font-main)" }}>استعد الوصول إلى حسابك</p>
                </div>
              </div>
              <button onClick={closeSheet} aria-label="إغلاق" style={{ width: 33, height: 33, borderRadius: "50%", border: "1px solid #E2DED8", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={13} color="#6B6560" />
              </button>
            </div>

            <div dir="rtl" style={{ padding: "20px 22px 28px", overflowY: "auto", flex: "1 1 auto" }}>
              {resetOk ? (
                <div style={{ textAlign: "center", padding: "30px 0 14px" }}>
                  <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#DCFCE7,#BBF7D0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 6px 22px rgba(22,163,74,0.18)" }}>
                    <CheckCircle2 size={38} color="#16A34A" />
                  </div>
                  <p style={{ fontFamily: "var(--font-main)", fontSize: 17, fontWeight: 800, color: "#1A1814", marginBottom: 6 }}>تم تغيير كلمة المرور!</p>
                  <p style={{ fontSize: 13, color: "#8A8480", marginBottom: 26, lineHeight: 1.7 }}>يتم تسجيل دخولك تلقائياً…</p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#C8A060,#8B6230)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Loader size={18} className="animate-spin" color="#fff" />
                    </div>
                  </div>
                </div>
              ) : !otpSent ? (
                <form onSubmit={e => { void handleForgot(e); }}>
                  <div style={{ padding: "11px 13px", borderRadius: 11, background: "#FDF9F3", border: "1px solid #EDE8DE", marginBottom: 16, display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 17, flexShrink: 0 }}>💡</span>
                    <p style={{ fontSize: 13, color: "#6B6560", margin: 0, fontFamily: "var(--font-main)", lineHeight: 1.7 }}>أدخل بريدك المسجّل وسنرسل لك رمز تحقق مكوّن من 6 أرقام</p>
                  </div>
                  <Input ref={firstRef} icon={<Mail size={17} color="#B8A88C" />} type="email" placeholder="البريد الإلكتروني المسجّل" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setErr(""); }} autoComplete="email" required />
                  {err && <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "11px 13px", borderRadius: 11, background: "#FEF0EE", border: "1px solid #FECACA", marginBottom: 13 }}><span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span><p style={{ fontSize: 13, color: "#DC2626", margin: 0, fontFamily: "var(--font-main)", lineHeight: 1.5 }}>{err}</p></div>}
                  <button type="submit" disabled={busy} style={{ width: "100%", padding: "14px 0", marginTop: 4, borderRadius: 13, border: "none", background: busy ? "#C0B8AE" : "linear-gradient(135deg,#C8A060 0%,#8B6230 100%)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14.5, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: busy ? "none" : "0 5px 18px rgba(168,120,60,0.32)" }}>
                    {busy && <Loader size={16} className="animate-spin" />}إرسال رمز التحقق
                  </button>
                </form>
              ) : (
                <form onSubmit={e => { void handleReset(e); }}>
                  <p style={{ fontSize: 13, color: "#6B6560", marginBottom: 3, lineHeight: 1.7, fontFamily: "var(--font-main)" }}>أدخل رمز التحقق المُرسَل إلى</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1A1814", marginBottom: 16, fontFamily: "var(--font-main)" }}>{forgotEmail}</p>
                  {import.meta.env.DEV && devOtp && (
                    <div style={{ padding: "9px 13px", borderRadius: 10, background: "#FFF9E6", border: "1px solid #F0D060", marginBottom: 13, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13 }}>🧪</span>
                      <p style={{ fontSize: 12, color: "#7A6000", margin: 0, fontFamily: "var(--font-main)" }}>رمز التطوير: <strong style={{ fontSize: 14, letterSpacing: 2 }}>{devOtp}</strong></p>
                    </div>
                  )}
                  <OTPInput value={otp} onChange={val => { setOtp(val); setOtpError(false); setErr(""); }} error={otpError} disabled={busy} />
                  <Input icon={<Lock size={17} color="#B8A88C" />} type={showNewPass ? "text" : "password"} placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)" value={newPass} onChange={e => { setNewPass(e.target.value); setErr(""); }} autoComplete="new-password" suffix={<button type="button" onClick={() => setShowNewPass(s => !s)} aria-label={showNewPass ? "إخفاء" : "إظهار"} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex" }}>{showNewPass ? <EyeOff size={16} color="var(--text-muted)" /> : <Eye size={16} color="var(--text-muted)" />}</button>} />
                  {newPass && <PasswordStrength password={newPass} />}
                  {err && <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "11px 13px", borderRadius: 11, background: "#FEF0EE", border: "1px solid #FECACA", marginBottom: 13 }}><span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span><p style={{ fontSize: 13, color: "#DC2626", margin: 0, fontFamily: "var(--font-main)", lineHeight: 1.5 }}>{err}</p></div>}
                  <button type="submit" disabled={busy} style={{ width: "100%", padding: "14px 0", borderRadius: 13, border: "none", background: busy ? "#C0B8AE" : "linear-gradient(135deg,#C8A060 0%,#8B6230 100%)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14.5, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 11, boxShadow: busy ? "none" : "0 5px 18px rgba(168,120,60,0.32)" }}>
                    {busy && <Loader size={16} className="animate-spin" />}تغيير كلمة المرور
                  </button>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button type="button" onClick={() => { void handleResend(); }} disabled={countdown > 0 || busy} style={{ background: "none", border: "none", cursor: countdown > 0 ? "default" : "pointer", fontSize: 12.5, color: countdown > 0 ? "#A09C96" : "var(--text-brand)", fontFamily: "var(--font-main)", padding: "4px 8px" }}>
                      {countdown > 0 ? `إعادة الإرسال بعد ${countdown} ثانية` : "لم يصلك الرمز؟ أعد الإرسال"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
