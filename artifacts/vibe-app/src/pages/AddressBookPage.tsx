import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, MapPin, Home, Briefcase, Plus, Trash2, Pencil, Check } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { apiFetch } from "../lib/apiFetch";
import { Input, Button } from "../components/ui";

type Address = {
  id: number;
  label: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  apartment?: string | null;
  zip?: string | null;
  is_default: boolean;
};

const formSchema = z.object({
  name:     z.string().min(2,  "الاسم مطلوب"),
  phone:    z.string().regex(/^05\d{8}$/, "رقم جوال صحيح مطلوب (05XXXXXXXX)"),
  city:     z.string().min(1,  "المدينة مطلوبة"),
  district: z.string().min(1,  "الحي مطلوب"),
  street:   z.string().min(1,  "الشارع مطلوب"),
});

const LABELS = ["المنزل", "العمل", "غيره"] as const;

function LabelIcon({ label }: { label: string }) {
  const s = { color: "var(--text-brand)" };
  if (label === "المنزل") return <Home size={15} style={s} />;
  if (label === "العمل")  return <Briefcase size={15} style={s} />;
  return <MapPin size={15} style={s} />;
}

function FormField({
  label, value, onChange, placeholder, type = "text", error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; error?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={error ? { borderColor: "var(--error)" } : undefined} />
      {error && <span style={{ fontSize: 11, color: "var(--error)" }}>{error}</span>}
    </div>
  );
}

export function AddressBookPage() {
  const [, navigate] = useLocation();
  const qc           = useQueryClient();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing,   setEditing]   = useState<Address | null>(null);

  const [label,     setLabel]     = useState("المنزل");
  const [name,      setName]      = useState("");
  const [phone,     setPhone]     = useState("");
  const [city,      setCity]      = useState("");
  const [district,  setDistrict]  = useState("");
  const [street,    setStreet]    = useState("");
  const [apartment, setApartment] = useState("");
  const [zip,       setZip]       = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn:  () => apiFetch<Address[]>("/addresses"),
    staleTime: 2 * 60_000,
  });

  function openAdd() {
    setEditing(null);
    setLabel("المنزل"); setName(""); setPhone(""); setCity("");
    setDistrict(""); setStreet(""); setApartment(""); setZip("");
    setIsDefault(addresses.length === 0);
    setFieldErrors({});
    setSheetOpen(true);
  }

  function openEdit(addr: Address) {
    setEditing(addr);
    setLabel(addr.label);
    setName(addr.name);
    setPhone(addr.phone);
    setCity(addr.city);
    setDistrict(addr.district);
    setStreet(addr.street);
    setApartment(addr.apartment ?? "");
    setZip(addr.zip ?? "");
    setIsDefault(addr.is_default);
    setFieldErrors({});
    setSheetOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = formSchema.safeParse({ name, phone, city, district, street });
      if (!parsed.success) {
        const e: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const k = String(issue.path[0]);
          if (!e[k]) e[k] = issue.message;
        }
        setFieldErrors(e);
        throw new Error("validation");
      }
      setFieldErrors({});
      const body = { label, name, phone, city, district, street, apartment, zip, is_default: isDefault };
      if (editing) {
        return apiFetch(`/addresses/${editing.id}`, { method: "PUT", auth: true, json: true, body: JSON.stringify(body) });
      }
      return apiFetch("/addresses", { method: "POST", auth: true, json: true, body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      setSheetOpen(false);
      toast(editing ? "تم تحديث العنوان ✓" : "تمت إضافة العنوان ✓");
    },
    onError: (e: Error) => {
      if (e.message !== "validation") toast.error(e.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/addresses/${id}`, { method: "DELETE", auth: true }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["addresses"] }); toast("تم حذف العنوان", { icon: "🗑️" }); },
    onError:    (e: Error) => toast.error(e.message),
  });

  const defaultMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/addresses/${id}/set-default`, { method: "PUT", auth: true }),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["addresses"] }),
    onError:    (e: Error) => toast.error(e.message),
  });

  return (
    <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-page)", paddingBottom: "var(--nav-h)" }}>

      {/* ── Header ── */}
      <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg-card)", borderBottom: "1px solid var(--border-warm)", flexShrink: 0 }}>
        <button onClick={() => navigate("/account")}
          style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--border-warm)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowRight size={17} style={{ color: "var(--text-primary)" }} />
        </button>
        <h1 style={{ fontFamily: "var(--font-main)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", flex: 1, textAlign: "center" }}>عناويني</h1>
        <button onClick={openAdd}
          style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          aria-label="إضافة عنوان">
          <Plus size={18} color="#fff" />
        </button>
      </div>

      {/* ── List ── */}
      <div className="hide-scrollbar page-enter" style={{ flex: 1, overflowY: "auto", padding: "14px" }} dir="rtl">

        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse" style={{ height: 110, borderRadius: 16, background: "#EDE8E2", marginBottom: 10 }} />
          ))
        ) : addresses.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, paddingTop: 80 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin size={32} style={{ color: "var(--text-brand)" }} />
            </div>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>لا توجد عناوين محفوظة</p>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 13, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>
              أضف عنوانك لتسريع عملية الطلب في المرة القادمة
            </p>
            <button onClick={openAdd}
              style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)", color: "#fff", fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              إضافة عنوان
            </button>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} style={{ borderRadius: 16, background: "var(--bg-card)", border: `1.5px solid ${addr.is_default ? "var(--gold)" : "var(--border-warm)"}`, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ padding: "13px 14px" }}>
                {/* Label row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: addr.is_default ? "var(--gold-pale)" : "#F4F3F1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <LabelIcon label={addr.label} />
                    </div>
                    <span style={{ fontFamily: "var(--font-main)", fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{addr.label}</span>
                    {addr.is_default && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "var(--gold-pale)", color: "var(--text-brand)", border: "1px solid rgba(192,168,130,0.45)" }}>
                        افتراضي
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(addr)} aria-label="تعديل"
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Pencil size={13} style={{ color: "var(--text-secondary)" }} />
                    </button>
                    <button onClick={() => deleteMutation.mutate(addr.id)} disabled={deleteMutation.isPending} aria-label="حذف"
                      style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Trash2 size={13} style={{ color: "#DC2626" }} />
                    </button>
                  </div>
                </div>
                {/* Details */}
                <p style={{ fontFamily: "var(--font-main)", fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {addr.name} · {addr.phone}
                </p>
                <p style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {addr.city}، حي {addr.district}، {addr.street}{addr.apartment ? `، ${addr.apartment}` : ""}
                </p>
              </div>
              {!addr.is_default && (
                <button onClick={() => defaultMutation.mutate(addr.id)} disabled={defaultMutation.isPending}
                  style={{ width: "100%", padding: "9px", border: "none", borderTop: "1px solid var(--border)", background: "transparent", fontFamily: "var(--font-main)", fontSize: 12, color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Check size={12} />
                  تعيين كعنوان افتراضي
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Add / Edit Sheet ── */}
      {sheetOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} onClick={() => setSheetOpen(false)} />
          <div dir="rtl" style={{ position: "absolute", bottom: 0, left: 0, right: 0, maxWidth: 430, margin: "0 auto", background: "var(--bg-card)", borderRadius: "24px 24px 0 0", padding: "20px 18px 40px", maxHeight: "90vh", overflowY: "auto" }}
            className="slide-up">
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 18px" }} />
            <h3 style={{ fontFamily: "var(--font-main)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", textAlign: "center", marginBottom: 20 }}>
              {editing ? "تعديل العنوان" : "إضافة عنوان جديد"}
            </h3>

            {/* Label selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {LABELS.map((l) => (
                <button key={l} onClick={() => setLabel(l)}
                  style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: `1.5px solid ${label === l ? "var(--gold)" : "var(--border)"}`, background: label === l ? "var(--gold-pale)" : "transparent", fontFamily: "var(--font-main)", fontSize: 12.5, fontWeight: label === l ? 700 : 400, color: label === l ? "var(--text-brand)" : "var(--text-secondary)", cursor: "pointer", transition: "all 0.15s" }}>
                  {l}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <FormField label="الاسم الكامل"      value={name}      onChange={setName}      placeholder="محمد أحمد"          error={fieldErrors.name} />
              <FormField label="رقم الجوال"         value={phone}     onChange={setPhone}     placeholder="0512345678" type="tel" error={fieldErrors.phone} />
              <FormField label="المدينة"            value={city}      onChange={setCity}      placeholder="الرياض"              error={fieldErrors.city} />
              <FormField label="الحي"               value={district}  onChange={setDistrict}  placeholder="العليا"              error={fieldErrors.district} />
              <FormField label="اسم الشارع والرقم" value={street}    onChange={setStreet}    placeholder="شارع الملك فهد، بناية ٢٠" error={fieldErrors.street} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FormField label="الشقة / المكتب"  value={apartment} onChange={setApartment} placeholder="شقة ٥" />
                <FormField label="الرمز البريدي"   value={zip}       onChange={setZip}       placeholder="12345" />
              </div>

              {/* Default toggle */}
              <button onClick={() => setIsDefault(v => !v)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", cursor: "pointer" }}>
                <span style={{ fontFamily: "var(--font-main)", fontSize: 13, color: "var(--text-primary)" }}>تعيين كعنوان افتراضي</span>
                <div style={{ width: 44, height: 24, borderRadius: 12, background: isDefault ? "var(--text-brand)" : "var(--border)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, insetInlineEnd: isDefault ? 3 : "auto", insetInlineStart: isDefault ? "auto" : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "all 0.2s" }} />
                </div>
              </button>

              <Button variant="primary" size="lg" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full rounded-[14px]">
                {saveMutation.isPending ? "جارٍ الحفظ..." : editing ? "حفظ التعديلات" : "إضافة العنوان"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
