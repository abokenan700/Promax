import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ChevronRight, User, Mail, Lock, Eye, EyeOff, Loader, CheckCircle2, Camera, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/Input";
import { PasswordStrength } from "../components/ui/PasswordStrength";
import { friendlyError } from "../lib/errors";
import { getAuthToken } from "../lib/apiFetch";

function resizeImage(file: File, maxSize = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const size   = Math.min(img.width, img.height, maxSize);
      canvas.width  = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas error")); return; }
      const offsetX = (img.width  - size) / 2;
      const offsetY = (img.height - size) / 2;
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function EditProfilePage() {
  const [, navigate]        = useLocation();
  const { user, refreshUser } = useAuth();
  const fileRef             = useRef<HTMLInputElement>(null);

  const [name, setName]   = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileBusy, setProfileBusy]       = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError]     = useState("");

  const [avatar, setAvatar]                 = useState<string | null>(user?.avatar ?? null);
  const [avatarBusy, setAvatarBusy]         = useState(false);
  const [avatarPreview, setAvatarPreview]   = useState<string | null>(user?.avatar ?? null);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass]         = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [passBusy, setPassBusy]       = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError]     = useState("");

  /* ── Redirect if not authenticated ── */
  useEffect(() => { if (!user) navigate("/account"); }, [user, navigate]);

  /* ── Sync state when user object updates ── */
  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setAvatar(user?.avatar ?? null);
    setAvatarPreview(user?.avatar ?? null);
  }, [user]);

  /* ── Warn on unsaved changes before leaving ── */
  const profileChanged = name.trim() !== (user?.name ?? "") || email.trim().toLowerCase() !== (user?.email ?? "");
  const passwordChanged = !!(currentPass || newPass);

  useEffect(() => {
    if (!profileChanged && !passwordChanged) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "لديك تغييرات غير محفوظة — هل تريد المغادرة؟";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [profileChanged, passwordChanged]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("يُرجى اختيار ملف صورة"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("الصورة أكبر من 10MB"); return; }
    try {
      setAvatarBusy(true);
      const dataUrl = await resizeImage(file, 300);
      setAvatarPreview(dataUrl);
      const token = getAuthToken();
      const r = await fetch("/api/v1/users/me/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ avatar: dataUrl }),
      });
      const data = await r.json() as { avatar?: string; error?: string };
      if (!r.ok) throw new Error(data.error ?? "خطأ في رفع الصورة");
      setAvatar(data.avatar ?? null);
      await refreshUser();
      toast.success("تم تحديث الصورة الشخصية ✅");
    } catch (err) {
      setAvatarPreview(avatar);
      toast.error(friendlyError(err instanceof Error ? err.message : ""));
    } finally {
      setAvatarBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemoveAvatar() {
    try {
      setAvatarBusy(true);
      setAvatarPreview(null);
      const token = getAuthToken();
      const r = await fetch("/api/v1/users/me/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ avatar: null }),
      });
      if (!r.ok) throw new Error("خطأ في حذف الصورة");
      setAvatar(null);
      await refreshUser();
      toast("تم حذف الصورة الشخصية");
    } catch (err) {
      setAvatarPreview(avatar);
      toast.error(friendlyError(err instanceof Error ? err.message : ""));
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profileChanged) return;
    if (!name.trim()) { setProfileError("الاسم لا يمكن أن يكون فارغاً"); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setProfileError("صيغة البريد الإلكتروني غير صحيحة"); return; }
    setProfileError(""); setProfileBusy(true); setProfileSuccess(false);
    try {
      const token = getAuthToken();
      const r = await fetch("/api/v1/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await r.json() as { user?: { name: string; email: string }; error?: string };
      if (!r.ok) throw new Error(data.error ?? "خطأ في التحديث");
      await refreshUser();
      setProfileSuccess(true);
      toast.success("تم تحديث المعلومات بنجاح ✅");
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(friendlyError(err instanceof Error ? err.message : ""));
    } finally {
      setProfileBusy(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPass || !newPass) { setPassError("جميع الحقول مطلوبة"); return; }
    if (newPass.length < 6) { setPassError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"); return; }
    if (currentPass === newPass) { setPassError("كلمة المرور الجديدة يجب أن تختلف عن الحالية"); return; }
    setPassError(""); setPassBusy(true); setPassSuccess(false);
    try {
      const token = getAuthToken();
      const r = await fetch("/api/v1/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const data = await r.json() as { message?: string; error?: string };
      if (!r.ok) throw new Error(data.error ?? "خطأ في تغيير كلمة المرور");
      setPassSuccess(true);
      setCurrentPass(""); setNewPass("");
      toast.success("تم تغيير كلمة المرور بنجاح 🔐");
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err) {
      setPassError(friendlyError(err instanceof Error ? err.message : ""));
    } finally {
      setPassBusy(false);
    }
  }

  if (!user) return null;

  return (
    <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: "var(--nav-h)" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, borderBottom: "1px solid var(--border)", background: "var(--bg-card)", display: "flex", alignItems: "center", gap: 8, padding: "14px 16px" }} dir="rtl">
        <button
          onClick={() => navigate("/account")}
          aria-label="رجوع إلى الحساب"
          style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "var(--input-bg-soft)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
        >
          <ChevronRight size={18} color="var(--text-secondary)" />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", margin: 0, fontFamily: "var(--font-main)" }}>تعديل الملف الشخصي</h1>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar" dir="rtl">

        {/* ── Avatar ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0 20px", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg,var(--gold),var(--gold-accent))", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 4px 20px rgba(192,168,130,0.4)", border: "3px solid var(--bg-card)", outline: "2px solid var(--gold-accent)" }}>
              {avatarBusy ? (
                <Loader size={28} color="rgba(255,255,255,0.8)" className="animate-spin" />
              ) : avatarPreview ? (
                <img src={avatarPreview} alt="صورة الملف الشخصي" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <User size={38} color="#fff" strokeWidth={1.5} />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarBusy}
              aria-label="تغيير الصورة الشخصية"
              style={{ position: "absolute", bottom: 0, insetInlineEnd: 0, width: 28, height: 28, borderRadius: "50%", background: "var(--bg-cta-dark)", border: "2.5px solid var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: avatarBusy ? "not-allowed" : "pointer" }}
            >
              <Camera size={13} color="#fff" />
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarBusy}
              style={{ padding: "7px 16px", borderRadius: 10, border: "1.5px solid var(--border-warm)", background: "var(--gold-pale)", color: "var(--text-brand)", fontFamily: "var(--font-main)", fontSize: 12.5, fontWeight: 700, cursor: avatarBusy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5 }}
            >
              <Camera size={13} /> تغيير الصورة
            </button>
            {avatarPreview && (
              <button
                type="button"
                onClick={() => { void handleRemoveAvatar(); }}
                disabled={avatarBusy}
                aria-label="حذف الصورة الشخصية"
                style={{ padding: "7px 14px", borderRadius: 10, border: "1.5px solid #FECACA", background: "#FEF0EE", color: "var(--error)", fontFamily: "var(--font-main)", fontSize: 12.5, fontWeight: 700, cursor: avatarBusy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5 }}
              >
                <Trash2 size={13} /> حذف
              </button>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={e => { void handleFileChange(e); }}
          />

          <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-main)", margin: 0, textAlign: "center" }}>
            JPG أو PNG — يتم القص تلقائياً إلى شكل دائري
          </p>
        </div>

        {/* ── Personal Info ── */}
        <div className="mx-3 mb-4">
          <div style={{ padding: "4px 4px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 3, height: 16, borderRadius: 2, background: "var(--gold)" }} />
            <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>المعلومات الشخصية</p>
          </div>
          <form onSubmit={e => { void handleProfileSave(e); }} style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", padding: "16px 14px" }}>
            <label htmlFor="edit-name" style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-main)", marginBottom: 6 }}>الاسم الكامل</label>
            <Input
              id="edit-name"
              icon={<User size={16} color="#B8A88C" />}
              type="text"
              placeholder="الاسم الكامل"
              value={name}
              onChange={e => { setName(e.target.value); setProfileError(""); setProfileSuccess(false); }}
              autoComplete="name"
            />

            <label htmlFor="edit-email" style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-main)", marginBottom: 6 }}>البريد الإلكتروني</label>
            <Input
              id="edit-email"
              icon={<Mail size={16} color="#B8A88C" />}
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={e => { setEmail(e.target.value); setProfileError(""); setProfileSuccess(false); }}
              autoComplete="email"
            />

            {profileError && (
              <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 10, background: "#FEF0EE", border: "1px solid #FECACA", marginBottom: 12 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                <p style={{ fontSize: 12.5, color: "#DC2626", margin: 0, fontFamily: "var(--font-main)", lineHeight: 1.5 }}>{profileError}</p>
              </div>
            )}
            {profileSuccess && (
              <div role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "rgba(90,138,74,0.08)", border: "1px solid rgba(90,138,74,0.3)", marginBottom: 12 }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <p style={{ fontSize: 12.5, color: "var(--success)", margin: 0, fontFamily: "var(--font-main)" }}>تم حفظ التغييرات بنجاح</p>
              </div>
            )}

            <button
              type="submit"
              disabled={profileBusy || !profileChanged}
              style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: (profileBusy || !profileChanged) ? "#D1CBBC" : "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: (profileBusy || !profileChanged) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s ease", boxShadow: (profileBusy || !profileChanged) ? "none" : "0 4px 14px rgba(0,0,0,0.18)" }}
            >
              {profileBusy ? <Loader size={16} className="animate-spin" /> : null}
              حفظ التغييرات
            </button>
          </form>
        </div>

        {/* ── Change Password ── */}
        <div className="mx-3 mb-6">
          <div style={{ padding: "4px 4px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 3, height: 16, borderRadius: 2, background: "var(--gold)" }} />
            <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>تغيير كلمة المرور</p>
          </div>
          <form onSubmit={e => { void handlePasswordSave(e); }} style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", padding: "16px 14px" }}>
            <label htmlFor="current-pass" style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-main)", marginBottom: 6 }}>كلمة المرور الحالية</label>
            <Input
              id="current-pass"
              icon={<Lock size={16} color="#B8A88C" />}
              type={showCurrent ? "text" : "password"}
              placeholder="كلمة المرور الحالية"
              value={currentPass}
              onChange={e => { setCurrentPass(e.target.value); setPassError(""); setPassSuccess(false); }}
              autoComplete="current-password"
              suffix={
                <button type="button" onClick={() => setShowCurrent(s => !s)} aria-label={showCurrent ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                  {showCurrent ? <EyeOff size={15} color="var(--text-muted)" /> : <Eye size={15} color="var(--text-muted)" />}
                </button>
              }
            />

            <label htmlFor="new-pass" style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-main)", marginBottom: 6 }}>كلمة المرور الجديدة</label>
            <Input
              id="new-pass"
              icon={<Lock size={16} color="#B8A88C" />}
              type={showNew ? "text" : "password"}
              placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)"
              value={newPass}
              onChange={e => { setNewPass(e.target.value); setPassError(""); setPassSuccess(false); }}
              autoComplete="new-password"
              suffix={
                <button type="button" onClick={() => setShowNew(s => !s)} aria-label={showNew ? "إخفاء كلمة المرور الجديدة" : "إظهار كلمة المرور الجديدة"} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                  {showNew ? <EyeOff size={15} color="var(--text-muted)" /> : <Eye size={15} color="var(--text-muted)" />}
                </button>
              }
            />
            {newPass && <PasswordStrength password={newPass} />}

            {passError && (
              <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 10, background: "#FEF0EE", border: "1px solid #FECACA", marginBottom: 12 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                <p style={{ fontSize: 12.5, color: "#DC2626", margin: 0, fontFamily: "var(--font-main)", lineHeight: 1.5 }}>{passError}</p>
              </div>
            )}
            {passSuccess && (
              <div role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "rgba(90,138,74,0.08)", border: "1px solid rgba(90,138,74,0.3)", marginBottom: 12 }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <p style={{ fontSize: 12.5, color: "var(--success)", margin: 0, fontFamily: "var(--font-main)" }}>تم تغيير كلمة المرور بنجاح</p>
              </div>
            )}

            <button
              type="submit"
              disabled={passBusy || !currentPass || !newPass}
              style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: (passBusy || !currentPass || !newPass) ? "#D1CBBC" : "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: (passBusy || !currentPass || !newPass) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s ease", boxShadow: (passBusy || !currentPass || !newPass) ? "none" : "0 4px 14px rgba(0,0,0,0.2)" }}
            >
              {passBusy ? <Loader size={16} className="animate-spin" /> : null}
              تغيير كلمة المرور
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
