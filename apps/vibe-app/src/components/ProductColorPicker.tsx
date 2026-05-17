import { colorToCss, needsBorder } from "../lib/colorMap";

interface ProductColorPickerProps {
  colors:      string[];
  activeColor: number;
  onSelect:    (index: number) => void;
}

/** T11: مكوّن اختيار اللون — مُستخرج من ProductDetailPage */
export function ProductColorPicker({ colors, activeColor, onSelect }: ProductColorPickerProps) {
  if (!colors || colors.length === 0) return null;

  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>
        اللون: <span style={{ fontWeight: 400, color: "#6A6764", marginInlineStart: 6 }}>{colors[activeColor]}</span>
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        {colors.map((c, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            aria-pressed={i === activeColor}
            aria-label={`اللون ${c}`}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: colorToCss(c),
              border: needsBorder(c) ? "1.5px solid #D0CBC4" : "none",
              cursor: "pointer",
              outline: i === activeColor ? "2.5px solid var(--gold)" : "2.5px solid transparent",
              outlineOffset: 2,
              boxShadow: i === activeColor ? "0 0 0 1px rgba(192,168,130,0.4)" : "none",
              transition: "outline 0.15s, box-shadow 0.15s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
