import { Search, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  onClear?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  readOnly?: boolean;
  autoFocus?: boolean;
  filtersRow?: React.ReactNode;
  navigateTo?: string;
}

export function SearchBar({
  placeholder = "ابحث عن منتجات، ماركات والمزيد...",
  value,
  onChange,
  onClear,
  onKeyDown,
  onFocus,
  readOnly = false,
  autoFocus = false,
  filtersRow,
  navigateTo,
}: SearchBarProps) {
  const [, navigate] = useLocation();
  const [focused, setFocused] = useState(false);

  function handleFocus() {
    setFocused(true);
    if (navigateTo) navigate(navigateTo);
    onFocus?.();
  }

  function handleBlur() {
    setFocused(false);
  }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderBottom: filtersRow ? undefined : "1px solid var(--border)",
        flexShrink: 0,
      }}
    >
      <div className="px-3 pt-3 pb-2.5">
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-2.5"
          style={{
            background: "var(--input-bg)",
            border: focused
              ? "1.5px solid var(--gold)"
              : "1px solid transparent",
            boxShadow: "none",
            transition: "border-color 0.18s ease, box-shadow 0.18s ease",
          }}
          dir="rtl"
        >
          <Search
            size={18}
            strokeWidth={1.8}
            className="flex-shrink-0"
            style={{ color: focused ? "var(--gold-accent)" : "var(--text-muted)", transition: "color 0.18s ease" }}
          />
          <input
            type={readOnly ? "text" : "search"}
            aria-label={placeholder}
            placeholder={placeholder}
            value={value ?? ""}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={onKeyDown}
            readOnly={readOnly}
            autoFocus={autoFocus}
            className="flex-1 min-w-0 bg-transparent placeholder:text-[--text-muted] text-[--text-primary] outline-none focus:outline-none focus-visible:outline-none"
            dir="rtl"
            style={{
              fontFamily: "var(--font-main)",
              fontSize: "clamp(11px, 3.2vw, 13px)",
              cursor: readOnly ? "pointer" : "text",
              outline: "none",
              outlineOffset: "0",
              border: "none",
              boxShadow: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
          />
          {onClear && value && value.length > 0 && (
            <button
              onClick={onClear}
              aria-label="مسح البحث"
              style={{ display: "flex", background: "none", border: "none", cursor: "pointer", padding: 2 }}
            >
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>
      </div>

      {filtersRow && (
        <div
          style={{
            borderBottom: "1px solid var(--border)",
            paddingBottom: "10px",
          }}
        >
          {filtersRow}
        </div>
      )}
    </div>
  );
}
