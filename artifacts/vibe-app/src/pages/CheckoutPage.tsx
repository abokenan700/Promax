import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { ArrowRight, MapPin, CreditCard, Truck, CheckCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { apiFetch } from "../lib/apiFetch";
import { calcShipping } from "../lib/shippingPolicy";
import { Input, Button } from "../components/ui";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";

const CHECKOUT_COMPLETE_KEY = "nakhba_checkout_complete";

const addressSchema = z.object({
  name:      z.string().min(2,  "الاسم مطلوب"),
  email:     z.string().email("بريد إلكتروني غير صحيح"),
  phone:     z.string().regex(/^05\d{8}$/, "رقم جوال سعودي صحيح مطلوب (05XXXXXXXX)"),
  city:      z.string().min(1,  "المدينة مطلوبة"),
  district:  z.string().min(1,  "الحي مطلوب"),
  street:    z.string().min(1,  "الشارع مطلوب"),
});

/* ── Stepper ────────────────────────────────────────────────────── */
function Stepper({ step }: { step: 1 | 2 }) {
  const steps = [{ n: 1, label: "العنوان" }, { n: 2, label: "الدفع" }, { n: 3, label: "التأكيد" }];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 0", gap: 0 }} dir="rtl">
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: s.n < step ? "var(--gold)" : s.n === step ? "linear-gradient(135deg,var(--bg-cta-dark),#2E2C2A)" : "var(--border)", color: s.n <= step ? "#fff" : "var(--text-muted)", fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, transition: "background 0.3s" }}>
              {s.n < step ? <CheckCircle size={14} /> : s.n}
            </div>
            <span style={{ fontSize: 10, color: s.n === step ? "var(--text-brand)" : "var(--text-muted)", fontWeight: s.n === step ? 700 : 400, whiteSpace: "nowrap" }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <div style={{ width: 40, height: 2, background: s.n < step ? "var(--gold)" : "var(--border)", margin: "0 4px", marginBottom: 18, transition: "background 0.3s" }} />}
        </div>
      ))}
    </div>
  );
}

/* ── Field ──────────────────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, type = "text", error }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; error?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }} dir="rtl">
      <label style={{ fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={error ? { borderColor: "var(--error)" } : undefined} />
      {error && <span style={{ fontSize: 11, color: "var(--error)" }}>{error}</span>}
    </div>
  );
}

/* ── T10: Order Summary (collapsible) ───────────────────────────── */
function OrderSummaryCollapsible({ total, discountAmount, shipping, grandTotal }: {
  total: number; discountAmount: number; shipping: number; grandTotal: number;
}) {
  const [open, setOpen] = useState(false);
  const { items } = useCart();

  return (
    <div style={{ borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border-warm)", overflow: "hidden" }} dir="rtl">
      <button onClick={() => setOpen(v => !v)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 14px", background: "none", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>ملخص الطلب</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--border)", padding: "2px 7px", borderRadius: 20 }}>{items.length} منتج</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 800, color: "var(--text-brand)" }}>{grandTotal.toLocaleString("ar-SA")} ر.س</span>
          {open ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />}
        </div>
      </button>

      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}>
        <div style={{ overflow: "hidden" }}>
          {items.map((i) => (
            <div key={`${i.id}-${i.color}`} style={{ display: "flex", gap: 10, padding: "10px 14px", borderTop: "1px solid var(--border)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--card-img-bg)", flexShrink: 0, overflow: "hidden" }}>
                <img src={i.image} alt={i.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }} className="line-clamp-1">{i.name}</p>
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>الكمية: {i.qty}{i.color ? ` — ${i.color}` : ""}</p>
              </div>
              <span style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-price)", flexShrink: 0 }}>{(i.price * i.qty).toLocaleString("ar-SA")} ر.س</span>
            </div>
          ))}
          {[
            { label: "المنتجات",  value: `${total.toLocaleString("ar-SA")} ر.س`, green: false },
            ...(discountAmount > 0 ? [{ label: "الخصم", value: `- ${discountAmount.toLocaleString("ar-SA")} ر.س`, green: true }] : []),
            { label: "الشحن",    value: shipping === 0 ? "مجاني 🎉" : `${shipping} ر.س`, green: shipping === 0 },
          ].map(({ label, value, green }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: green ? "#5A8A4A" : "var(--text-primary)" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Payment Method Card ─────────────────────────────────────────── */
function PaymentCard({ id, icon, title, subtitle, selected, onSelect, disabled, badge }: {
  id: string; icon: React.ReactNode; title: string; subtitle: string;
  selected: boolean; onSelect: () => void; disabled?: boolean; badge?: string;
}) {
  return (
    <button onClick={disabled ? undefined : onSelect} dir="rtl" disabled={disabled}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px", borderRadius: 14, border: `2px solid ${selected ? "var(--gold)" : "var(--border-warm)"}`, background: disabled ? "var(--bg-page)" : selected ? "var(--gold-pale)" : "var(--bg-card)", cursor: disabled ? "not-allowed" : "pointer", width: "100%", textAlign: "start", transition: "border-color 0.2s, background 0.2s", opacity: disabled ? 0.5 : 1, position: "relative" }}>
      {badge && (
        <span style={{ position: "absolute", top: 8, insetInlineStart: 8, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "var(--border)", color: "var(--text-muted)" }}>{badge}</span>
      )}
      <div style={{ width: 42, height: 42, borderRadius: 12, background: selected ? "var(--gold-light)" : "#F4F3F1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "var(--font-main)", fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{title}</p>
        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{subtitle}</p>
      </div>
      <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${selected ? "var(--gold)" : "var(--border)"}`, background: selected ? "var(--gold)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
      </div>
    </button>
  );
}

/* ── T19: Format card number with spaces ──────────────────────── */
function formatCardNumber(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

type SavedAddress = {
  id: number; label: string; name: string; phone: string;
  city: string; district: string; street: string;
  apartment?: string | null; zip?: string | null; is_default: boolean;
};

/* ── PAGE ─────────────────────────────────────────────────────────── */
export function CheckoutPage() {
  const [, navigate] = useLocation();
  const { total, items, discountAmount, clearCart } = useCart();
  const { user } = useAuth();

  const { data: savedAddresses = [] } = useQuery<SavedAddress[]>({
    queryKey: ["addresses"],
    queryFn: () => apiFetch<SavedAddress[]>("/addresses"),
    enabled: !!user,
    staleTime: 2 * 60_000,
  });

  const shipping   = calcShipping(total);
  const grandTotal = total - discountAmount + shipping;

  /* Step 1: Address + T27: email */
  const [step, setStep]             = useState<1 | 2>(1);
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");       /* T27 */
  const [phone, setPhone]           = useState("");
  const [city, setCity]             = useState("");
  const [district, setDistrict]     = useState("");
  const [street, setStreet]         = useState("");
  const [apartment, setApartment]   = useState("");       /* T20 */
  const [zip, setZip]               = useState("");       /* T20 */
  const [errors, setErrors]         = useState<Record<string, string>>({});

  /* Step 2: Payment */
  const [payMethod, setPayMethod]   = useState("cod");
  const [cardNum, setCardNum]       = useState("");
  const [cardName, setCardName]     = useState("");
  const [cardExp, setCardExp]       = useState("");
  const [cardCvv, setCardCvv]       = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState("");   /* T11 */

  /* Pre-fill email from logged-in user on mount */
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  function validateStep1(): boolean {
    const result = addressSchema.safeParse({ name: name.trim(), email: email.trim(), phone: phone.trim(), city: city.trim(), district: district.trim(), street: street.trim() });
    if (result.success) { setErrors({}); return true; }
    const e: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0]);
      if (!e[field]) e[field] = issue.message;
    }
    setErrors(e);
    return false;
  }

  function validateStep2(): boolean {
    if (payMethod !== "card") return true;
    const e: Record<string, string> = {};
    if (!cardNum.trim() || cardNum.replace(/\s/g, "").length < 13) e.cardNum = "رقم البطاقة غير صحيح";
    if (!cardName.trim())                                           e.cardName = "اسم حامل البطاقة مطلوب";
    if (!cardExp.trim() || !/^\d{2}\/\d{2}$/.test(cardExp.trim())) e.cardExp = "صيغة التاريخ: MM/YY";
    if (!cardCvv.trim() || cardCvv.length < 3)                     e.cardCvv = "CVV غير صحيح";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validateStep2()) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        items: items.map((i) => ({ product_id: i.id, name: i.name, brand: i.brand, price: i.price, qty: i.qty, color: i.color, image: i.image ?? "" })),
        payment_method:   payMethod,
        address_name:     name.trim(),
        address_email:    email.trim(),
        address_phone:    phone.trim(),
        address_city:     city.trim(),
        address_district: district.trim(),
        address_street:   street.trim(),
        address_apartment: apartment.trim(),
        address_zip:      zip.trim(),
        subtotal: total,
        shipping,
        total:    grandTotal,
      };

      const result = await apiFetch<{ orderId: string; total: string }>(
        "/orders",
        { method: "POST", auth: true, json: true, body: JSON.stringify(payload) }
      );

      clearCart();
      sessionStorage.setItem(CHECKOUT_COMPLETE_KEY, "1");
      sessionStorage.setItem("nakhba_payment_method", payMethod);
      sessionStorage.setItem("nakhba_last_order_id", result.orderId);
      navigate("/order/success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "تعذّر تأكيد الطلب — حاول مجدداً";
      setSubmitError(msg);   /* T11: inline retry */
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-page)", paddingBottom: "var(--nav-h)" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg-card)", borderBottom: "1px solid var(--border-warm)", flexShrink: 0 }} dir="rtl">
        <button onClick={() => step === 1 ? navigate("/cart") : setStep(1)}
          style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--border-warm)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowRight size={17} style={{ color: "var(--text-primary)" }} />
        </button>
        <h1 style={{ fontFamily: "var(--font-main)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", flex: 1, textAlign: "center" }}>
          {step === 1 ? "عنوان التوصيل" : "طريقة الدفع"}
        </h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Stepper */}
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-warm)", flexShrink: 0 }}>
        <Stepper step={step} />
      </div>

      {/* Content */}
      <div className="hide-scrollbar" style={{ flex: "1 1 auto", overflowY: "auto", padding: "16px" }}>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px", borderRadius: 14, background: "var(--gold-pale)", border: "1px solid rgba(192,168,130,0.3)" }} dir="rtl">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MapPin size={18} style={{ color: "var(--text-brand)" }} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>أين تريد توصيل طلبك؟</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>أدخل عنوانك بدقة لضمان التوصيل</p>
              </div>
            </div>

            {/* Saved addresses quick-fill */}
            {savedAddresses.length > 0 && (
              <div dir="rtl">
                <p style={{ fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>عناوين محفوظة</p>
                <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                  {savedAddresses.map((addr) => (
                    <button key={addr.id}
                      onClick={() => {
                        setName(addr.name); setPhone(addr.phone);
                        setCity(addr.city); setDistrict(addr.district);
                        setStreet(addr.street);
                        setApartment(addr.apartment ?? "");
                        setZip(addr.zip ?? "");
                        toast("تم تحميل العنوان ✓");
                      }}
                      style={{
                        flexShrink: 0, padding: "9px 13px", borderRadius: 11,
                        border: "1.5px solid var(--border-warm)",
                        background: "var(--bg-card)", cursor: "pointer",
                        textAlign: "right", minWidth: 140,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}>
                      <p style={{ fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 700, color: "var(--text-brand)", marginBottom: 2 }}>
                        {addr.label}{addr.is_default ? " ★" : ""}
                      </p>
                      <p style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        {addr.city}، {addr.district}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* T27: Email field for order confirmation */}
            <Field label="البريد الإلكتروني (لتأكيد الطلب)" value={email} onChange={setEmail} placeholder="example@gmail.com" type="email" error={errors.email} />
            <Field label="الاسم الكامل"            value={name}      onChange={setName}      placeholder="محمد أحمد العلي"          error={errors.name} />
            <Field label="رقم الجوال"               value={phone}     onChange={setPhone}     placeholder="0512345678" type="tel"    error={errors.phone} />
            <Field label="المدينة"                  value={city}      onChange={setCity}      placeholder="الرياض"                   error={errors.city} />
            <Field label="الحي"                     value={district}  onChange={setDistrict}  placeholder="العليا"                   error={errors.district} />
            <Field label="اسم الشارع والرقم"        value={street}    onChange={setStreet}    placeholder="شارع الملك فهد، بناية ٢٠" error={errors.street} />

            {/* T20: Apartment + postal code */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="رقم الشقة / المكتب (اختياري)"  value={apartment} onChange={setApartment} placeholder="شقة ٥" />
              <Field label="الرمز البريدي (اختياري)" value={zip}       onChange={setZip}       placeholder="12345" type="text" />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 12, background: "#F0F8F0", border: "1px solid #C8E6C0" }} dir="rtl">
              <Truck size={16} style={{ color: "#5A8A4A", flexShrink: 0 }} />
              <p style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "#4A7A3A" }}>
                {shipping === 0 ? "✓ تأهّلت للشحن المجاني!" : `أضف ${(500 - total).toLocaleString("ar-SA")} ر.س للحصول على شحن مجاني`}
              </p>
            </div>

            {/* T10: Order summary in step 1 */}
            <OrderSummaryCollapsible total={total} discountAmount={discountAmount} shipping={shipping} grandTotal={grandTotal} />
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }} dir="rtl">اختر طريقة الدفع</p>

            <PaymentCard id="cod"
              icon={<Truck size={18} style={{ color: "var(--text-brand)" }} />}
              title="الدفع عند الاستلام" subtitle="ادفع نقداً عند وصول الطلب"
              selected={payMethod === "cod"} onSelect={() => setPayMethod("cod")} />

            {/* T12: Apple Pay disabled / "قريباً" */}
            <PaymentCard id="apple"
              icon={<span style={{ fontSize: 20 }}>󰊪</span>}
              title="Apple Pay / مدى" subtitle="قريباً — نعمل على تفعيله"
              selected={false} onSelect={() => {}} disabled badge="قريباً" />

            <PaymentCard id="card"
              icon={<CreditCard size={18} style={{ color: "var(--text-brand)" }} />}
              title="بطاقة ائتمان/خصم" subtitle="Visa، Mastercard، mada"
              selected={payMethod === "card"} onSelect={() => setPayMethod("card")} />

            {payMethod === "card" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 14, borderRadius: 14, background: "var(--gold-pale)", border: "1px solid rgba(192,168,130,0.3)" }}>
                {/* T19: Formatted card number */}
                <Field label="رقم البطاقة" value={cardNum}
                  onChange={(v) => setCardNum(formatCardNumber(v))}
                  placeholder="0000 0000 0000 0000" error={errors.cardNum} />
                <Field label="اسم حامل البطاقة" value={cardName} onChange={setCardName} placeholder="MOHAMMED AHMED" error={errors.cardName} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="تاريخ الانتهاء" value={cardExp} onChange={setCardExp} placeholder="MM/YY" error={errors.cardExp} />
                  <Field label="CVV" value={cardCvv} onChange={(v) => setCardCvv(v.replace(/\D/g, "").slice(0, 3))} placeholder="123" error={errors.cardCvv} />
                </div>
              </div>
            )}

            {/* Order summary — step 2 */}
            <div style={{ borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border-warm)", overflow: "hidden" }} dir="rtl">
              <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-warm)" }}>
                <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>ملخص الطلب</p>
              </div>
              {[
                { label: "المنتجات",  value: `${total.toLocaleString("ar-SA")} ر.س`, green: false },
                ...(discountAmount > 0 ? [{ label: "الخصم", value: `- ${discountAmount.toLocaleString("ar-SA")} ر.س`, green: true }] : []),
                { label: "الشحن",    value: shipping === 0 ? "مجاني 🎉" : `${shipping} ر.س`, green: shipping === 0 },
              ].map(({ label, value, green }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: green ? "#5A8A4A" : "var(--text-primary)" }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px" }}>
                <span style={{ fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>الإجمالي</span>
                <span style={{ fontFamily: "var(--font-main)", fontSize: 16, fontWeight: 800, color: "var(--text-brand)" }}>{grandTotal.toLocaleString("ar-SA")} ر.س</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: "12px 16px", background: "var(--bg-card)", borderTop: "1px solid var(--border-warm)", flexShrink: 0 }}>
        {/* T11: Inline retry UI */}
        {submitError && (
          <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#FEF0EE", border: "1px solid #F87171", marginBottom: 10 }}>
            <span style={{ flex: 1, fontFamily: "var(--font-main)", fontSize: 12, color: "#C03030" }}>{submitError}</span>
            <button onClick={() => { setSubmitError(""); void handleSubmit(); }}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid #C03030", background: "transparent", color: "#C03030", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              <RefreshCw size={12} />إعادة المحاولة
            </button>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 10 }} dir="rtl">
          {[{ icon: "🔒", text: "دفع آمن" }, { icon: "✓", text: "منتجات أصلية" }, { icon: "↩", text: "إرجاع مجاني" }].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 11 }}>{icon}</span>
              <span style={{ fontFamily: "var(--font-main)", fontSize: "var(--text-2xs)", color: "var(--text-muted)", fontWeight: 600 }}>{text}</span>
            </div>
          ))}
        </div>

        <Button variant="primary" size="lg"
          onClick={() => {
            if (step === 1) { if (validateStep1()) setStep(2); }
            else { void handleSubmit(); }
          }}
          disabled={isSubmitting}
          className="w-full rounded-[14px]"
          style={{ opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? (
            <><div className="page-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />جارٍ تأكيد الطلب...</>
          ) : step === 1 ? (
            "التالي — اختر طريقة الدفع"
          ) : (
            `إتمام الطلب — ${grandTotal.toLocaleString("ar-SA")} ر.س`
          )}
        </Button>
      </div>
    </div>
  );
}
