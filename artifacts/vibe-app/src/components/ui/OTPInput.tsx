import { useRef, useState, useEffect, type KeyboardEvent, type ClipboardEvent } from "react";

interface OTPInputProps {
  length?:   number;
  value:     string;
  onChange:  (val: string) => void;
  disabled?: boolean;
  error?:    boolean;
}

export function OTPInput({ length = 6, value, onChange, disabled, error }: OTPInputProps) {
  const [focused, setFocused]   = useState<number | null>(null);
  const [shake, setShake]       = useState(false);
  const refs                    = useRef<(HTMLInputElement | null)[]>([]);
  const prevError               = useRef(false);
  const digits                  = value.padEnd(length, "").split("").slice(0, length);

  /* ── Auto-focus first cell on mount ── */
  useEffect(() => { refs.current[0]?.focus(); }, []);

  /* ── Shake animation when error becomes true ── */
  useEffect(() => {
    if (error && !prevError.current) {
      setShake(true);
      prevError.current = true;
      const t = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t);
    }
    if (!error) { prevError.current = false; }
    return undefined;
  }, [error]);

  function handleChange(idx: number, char: string) {
    const digit  = char.replace(/\D/g, "").slice(-1);
    const next   = digits.slice();
    next[idx]    = digit;
    const newVal = next.join("").replace(/\s/g, "");
    onChange(newVal);
    if (digit && idx < length - 1) refs.current[idx + 1]?.focus();
  }

  function handleKey(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = digits.slice(); next[idx] = "";
        onChange(next.join("").replace(/\s/g, ""));
      } else if (idx > 0) {
        refs.current[idx - 1]?.focus();
        const next = digits.slice(); next[idx - 1] = "";
        onChange(next.join("").replace(/\s/g, ""));
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft")  { refs.current[idx + 1]?.focus(); }
      else if (e.key === "ArrowRight") { refs.current[idx - 1]?.focus(); }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted   = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, length - 1);
    refs.current[focusIdx]?.focus();
  }

  return (
    <div
      dir="ltr"
      role="group"
      aria-label="رمز التحقق المكوّن من 6 أرقام"
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        marginBottom: 16,
        animation: shake ? "otp-shake 0.55s cubic-bezier(.36,.07,.19,.97)" : "none",
      }}
    >
      {Array.from({ length }).map((_, idx) => {
        const isFocused = focused === idx;
        const hasVal    = !!digits[idx];
        return (
          <input
            key={idx}
            ref={el => { refs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[idx] || ""}
            onChange={e => handleChange(idx, e.target.value)}
            onKeyDown={e => handleKey(idx, e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(idx)}
            onBlur={() => setFocused(null)}
            disabled={disabled}
            aria-label={`الرقم ${idx + 1} من 6`}
            aria-invalid={error ? "true" : "false"}
            style={{
              width: 44,
              height: 52,
              textAlign: "center",
              fontSize: 22,
              fontWeight: 800,
              fontFamily: "var(--font-main)",
              color: error ? "var(--error)" : "var(--text-primary)",
              background: hasVal
                ? (error ? "#FEF0EE" : "var(--gold-pale)")
                : "var(--input-bg-soft)",
              border: `2px solid ${
                error      ? "var(--error)"
                : isFocused ? "var(--gold)"
                : hasVal    ? "var(--gold-accent)"
                : "#E8E4DE"
              }`,
              borderRadius: 12,
              outline: "none",
              transition: "all 0.2s ease",
              cursor: disabled ? "not-allowed" : "text",
              transform: hasVal && !shake ? "scale(1.05)" : "scale(1)",
              boxShadow: isFocused ? "0 0 0 3px rgba(192,168,130,0.2)" : "none",
              WebkitAppearance: "none",
            }}
          />
        );
      })}
    </div>
  );
}
