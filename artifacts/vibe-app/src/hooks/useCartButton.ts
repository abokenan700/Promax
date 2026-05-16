import { useState, useEffect, useCallback } from "react";
import type { Product } from "@workspace/api-client-react";
import { useCart } from "../context/CartContext";

export function useCartButton(product?: Product, selectedColor?: string, duration = 1500) {
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), duration);
    return () => clearTimeout(timer);
  }, [added, duration]);

  const handleAdd = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (added) return;
    if (product) addToCart(product, selectedColor);
    setAdded(true);
  }, [added, product, selectedColor, addToCart]);

  return { added, handleAdd };
}
