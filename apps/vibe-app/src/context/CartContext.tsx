import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Product } from "@workspace/api-client-react";
import { getDeviceHeaders, apiFetch } from "../lib/apiFetch";
import { API_BASE } from "../lib/apiBase";

export const MAX_QTY = 10;

export type CartItem = Pick<Product, "id" | "name" | "brand" | "price" | "image"> & {
  qty:   number;
  color: string;
};

interface CartContextValue {
  items:          CartItem[];
  count:          number;
  total:          number;
  discountPct:    number;
  discountAmount: number;
  couponCode:     string | null;
  applyCoupon:    (code: string) => Promise<void>;
  removeCoupon:   () => void;
  addToCart:      (product: Product, color?: string) => void;
  removeFromCart: (id: number, color: string) => void;
  updateQty:      (id: number, color: string, delta: number) => void;
  clearCart:      () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY        = "nakhba_cart";
const COUPON_STORAGE_KEY = "nakhba_coupon";

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch { return []; }
}

function loadCouponFromStorage(): { code: string | null; pct: number } {
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as { code: string | null; pct: number }) : { code: null, pct: 0 };
  } catch { return { code: null, pct: 0 }; }
}

function saveToStorage(items: CartItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { }
}

async function apiAddToCart(product_id: number, qty: number, color: string) {
  await fetch(`${API_BASE}/cart`, {
    method: "POST",
    headers: getDeviceHeaders({ json: true }),
    body: JSON.stringify({ product_id, qty, color }),
  });
}

async function apiRemoveFromCart(product_id: number, color: string) {
  const encoded = encodeURIComponent(color);
  await fetch(`${API_BASE}/cart/product/${product_id}?color=${encoded}`, {
    method: "DELETE",
    headers: getDeviceHeaders(),
  });
}

async function apiPatchQty(product_id: number, qty: number, color: string) {
  await fetch(`${API_BASE}/cart/product/${product_id}`, {
    method: "PATCH",
    headers: getDeviceHeaders({ json: true }),
    body: JSON.stringify({ qty, color }),
  });
}

async function apiClearCart() {
  await fetch(`${API_BASE}/cart`, { method: "DELETE", headers: getDeviceHeaders() });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems]               = useState<CartItem[]>(loadFromStorage);
  const [couponCode, setCouponCode]     = useState<string | null>(() => loadCouponFromStorage().code);
  const [discountPct, setDiscountPct]   = useState<number>(() => loadCouponFromStorage().pct);

  useEffect(() => { saveToStorage(items); }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify({ code: couponCode, pct: discountPct }));
    } catch { }
  }, [couponCode, discountPct]);

  const addToCart = useCallback((product: Product, color?: string) => {
    const selectedColor = color ?? product.colors?.[0] ?? "";
    let snapshot: CartItem[] = [];
    setItems((prev) => {
      snapshot = prev;
      const existing = prev.find((i) => i.id === product.id && i.color === selectedColor);
      if (existing && existing.qty >= MAX_QTY) {
        toast.error(`الحد الأقصى ${MAX_QTY} وحدات لكل منتج`);
        return prev;
      }
      return existing
        ? prev.map((i) =>
            i.id === product.id && i.color === selectedColor
              ? { ...i, qty: Math.min(MAX_QTY, i.qty + 1) }
              : i
          )
        : [
            ...prev,
            { id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image, qty: 1, color: selectedColor },
          ];
    });
    toast.success(`أُضيف "${product.name}" إلى السلة`);
    apiAddToCart(product.id, 1, selectedColor).catch(() => {
      setItems(snapshot);
      toast.error("تعذّر مزامنة السلة — تم التراجع");
    });
  }, []);

  const removeFromCart = useCallback((id: number, color: string) => {
    let snapshot: CartItem[] = [];
    setItems((prev) => { snapshot = prev; return prev.filter((i) => !(i.id === id && i.color === color)); });
    apiRemoveFromCart(id, color).catch(() => {
      setItems(snapshot);
      toast.error("تعذّر حذف المنتج من السلة");
    });
  }, []);

  const updateQty = useCallback((id: number, color: string, delta: number) => {
    let newQty = 1;
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id && i.color === color) {
          newQty = Math.min(MAX_QTY, Math.max(1, i.qty + delta));
          if (delta > 0 && i.qty >= MAX_QTY) {
            toast.error(`الحد الأقصى ${MAX_QTY} وحدات`);
          }
          return { ...i, qty: newQty };
        }
        return i;
      })
    );
    apiPatchQty(id, newQty, color).catch(() => {});
  }, []);

  const clearCart = useCallback(() => {
    let snapshot: CartItem[] = [];
    setItems((prev) => { snapshot = prev; return []; });
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    apiClearCart().catch(() => { setItems(snapshot); });
  }, []);

  const applyCoupon = useCallback(async (code: string): Promise<void> => {
    const result = await apiFetch<{ code: string; discountPct: number; description: string }>(
      "/coupons/validate",
      { method: "POST", json: true, body: JSON.stringify({ code }) }
    );
    setCouponCode(result.code);
    setDiscountPct(result.discountPct);
  }, []);

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    setDiscountPct(0);
  }, []);

  const count          = items.reduce((s, i) => s + i.qty, 0);
  const total          = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmount = Math.round(total * discountPct) / 100;

  return (
    <CartContext.Provider value={{
      items, count, total,
      discountPct, discountAmount, couponCode,
      applyCoupon, removeCoupon,
      addToCart, removeFromCart, updateQty, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
