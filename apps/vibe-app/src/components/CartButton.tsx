import { motion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import type { Product } from "@workspace/api-client-react";
import { useCartButton } from "../hooks/useCartButton";

interface CartButtonProps {
  size?: "sm" | "md";
  product?: Product;
  selectedColor?: string;
}

/* ── مشكلة 38: الحد الأدنى لمساحة اللمس 44×44px (WCAG 2.5.5) ── */
export function CartButton({ size = "md", product, selectedColor }: CartButtonProps) {
  const { added, handleAdd } = useCartButton(product, selectedColor);

  /* الحجم البصري للدائرة */
  const dim  = size === "sm" ? 32 : 36;
  const icon = size === "sm" ? 16 : 18;

  return (
    <button
      onClick={handleAdd}
      aria-label={added ? "تمت الإضافة للسلة" : "أضف للسلة"}
      /* minWidth/minHeight 44px تضمن مساحة لمس كافية حتى لو الدائرة أصغر */
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        minWidth: 44,
        minHeight: 44,
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
    >
      <motion.div
        whileTap={{ scale: 0.80 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className="flex items-center justify-center rounded-full transition-colors duration-300"
        style={{
          width: dim,
          height: dim,
          background: added
            ? "linear-gradient(135deg, var(--success), #4a8a4a)"
            : "linear-gradient(135deg, var(--gold-gradient-start), var(--gold), var(--gold-accent))",
          boxShadow: added
            ? "var(--shadow-success)"
            : "var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.22)",
        }}
      >
        {added
          ? <Check size={icon} strokeWidth={2.5} color="#fff" />
          : <ShoppingBag size={icon} strokeWidth={2} color="#fff" />
        }
      </motion.div>
    </button>
  );
}
