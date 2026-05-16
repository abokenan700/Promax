import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Product } from "@workspace/api-client-react";
import { getDeviceHeaders } from "../lib/apiFetch";
import { API_BASE } from "../lib/apiBase";

interface WishlistContextValue {
  wishlist: Product[];
  isWishlisted: (id: number) => boolean;
  toggleWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = "nakhba_wishlist";

function loadFromStorage(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch { return []; }
}

function saveToStorage(items: Product[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { }
}

async function apiAddToWishlist(product_id: number) {
  await fetch(`${API_BASE}/wishlist/${product_id}`, {
    method: "POST",
    headers: getDeviceHeaders(),
  });
}

async function apiRemoveFromWishlist(product_id: number) {
  await fetch(`${API_BASE}/wishlist/${product_id}`, {
    method: "DELETE",
    headers: getDeviceHeaders(),
  });
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>(loadFromStorage);

  useEffect(() => { saveToStorage(wishlist); }, [wishlist]);

  const isWishlisted = useCallback(
    (id: number) => wishlist.some((p) => p.id === id),
    [wishlist]
  );

  const toggleWishlist = useCallback((product: Product) => {
    let snapshot: Product[] = [];
    const exists = wishlist.some((p) => p.id === product.id);
    setWishlist((prev) => {
      snapshot = prev;
      return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    });
    if (exists) {
      toast("أُزيل من المفضلة", { icon: "🤍" });
      apiRemoveFromWishlist(product.id).catch(() => {
        setWishlist(snapshot);
        toast.error("تعذّر تحديث المفضلة");
      });
    } else {
      toast.success(`أُضيف "${product.name}" إلى المفضلة`);
      apiAddToWishlist(product.id).catch(() => {
        setWishlist(snapshot);
        toast.error("تعذّر تحديث المفضلة");
      });
    }
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
