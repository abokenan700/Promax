import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      icon,
      suffix,
      containerClassName,
      containerStyle,
      className,
      onFocus,
      onBlur,
      style,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      setFocused(true);
      onFocus?.(e);
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      setFocused(false);
      onBlur?.(e);
    }

    return (
      <div
        className={cn("relative", containerClassName)}
        style={{
          borderRadius: "var(--radius-md)",
          border: `1.5px solid ${focused ? "var(--gold)" : "#E2DDD6"}`,
          background: "var(--input-bg-soft)",
          transition: "border-color var(--duration-base, 0.25s) var(--ease-standard, ease)",
          marginBottom: 12,
          ...containerStyle,
        }}
      >
        {icon && (
          <span
            className="absolute inset-y-0 flex items-center pointer-events-none"
            style={{ insetInlineStart: 14 }}
          >
            {icon}
          </span>
        )}

        <input
          ref={ref}
          dir="rtl"
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "w-full bg-transparent",
            "placeholder:text-[var(--text-muted)] text-[var(--text-primary)]",
            icon ? "ps-[44px]" : "ps-4",
            suffix ? "pe-10" : "pe-4",
            "py-[11px]",
            className
          )}
          style={{
            fontFamily: "var(--font-main)",
            fontSize: "var(--text-base)",
            border: "none",
            outline: 0,
            boxSizing: "border-box",
            boxShadow: "none",
            WebkitAppearance: "none",
            WebkitTapHighlightColor: "transparent",
            ...style,
          }}
          {...props}
        />

        {suffix && (
          <span
            className="absolute inset-y-0 flex items-center"
            style={{ insetInlineEnd: 10 }}
          >
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
