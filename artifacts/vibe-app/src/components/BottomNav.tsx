import { useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Home, LayoutGrid, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

const GOLD     = "var(--text-brand)";
const INACTIVE = "var(--text-muted)";
const BADGE_BG = "var(--error)";

export type NavId = "home" | "categories" | "wishlist" | "cart";

const NAV_ROUTE: Record<NavId, string> = {
  home:       "/",
  categories: "/categories",
  wishlist:   "/wishlist",
  cart:       "/cart",
};

const navItems: { id: NavId; label: string; Icon: React.ElementType }[] = [
  { id: "home",       label: "الرئيسية",  Icon: Home        },
  { id: "categories", label: "التصنيفات", Icon: LayoutGrid  },
  { id: "wishlist",   label: "المفضلة",   Icon: Heart       },
  { id: "cart",       label: "السلة",     Icon: ShoppingBag },
];

export function BottomNav() {
  const [location, navigate] = useLocation();
  const { count } = useCart();

  /* ── مشكلة 67: roving tabindex refs ─────────────────────────── */
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* مشكلة 55: استُبدل `as NavId` بتحقق صريح من الـ Record */
  function activeIdFromPath(path: string): NavId {
    if (path === "/" || path === "") return "home";
    const match = Object.entries(NAV_ROUTE).find(
      ([, route]) => path.startsWith(route) && route !== "/"
    );
    const id = match?.[0];
    return id !== undefined && id in NAV_ROUTE ? (id as NavId) : "home";
  }

  const activeId  = activeIdFromPath(location);
  const activeIdx = navItems.findIndex(n => n.id === activeId);

  /* ── مشكلة 67: Arrow Key navigation (RTL-aware) ──────────────
     التطبيق بالعربية RTL — ArrowLeft يتقدم للأمام، ArrowRight للخلف
     Home → أول تبويب، End → آخر تبويب
     Tab/Shift+Tab يخرج من الـ tablist كلياً (roving tabindex)   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const total = navItems.length;
      let next = activeIdx;

      switch (e.key) {
        case "ArrowLeft":  next = (activeIdx + 1) % total;              break;
        case "ArrowRight": next = (activeIdx - 1 + total) % total;     break;
        case "Home":       next = 0;                                     break;
        case "End":        next = total - 1;                             break;
        default:           return;
      }

      e.preventDefault();
      const nextItem = navItems[next];
      navigate(NAV_ROUTE[nextItem.id]);
      /* نقل focus للزر المحدد (roving tabindex) */
      btnRefs.current[next]?.focus();
    },
    [activeIdx, navigate]
  );

  // مشكلة 140: pb-safe كان يتطلب tailwindcss-safe-area plugin غير مُثبَّت → CSS env() مباشرة
  return (
    <nav
      className="border-t h-full flex items-center justify-between px-2 pt-1.5"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)", paddingBottom: "max(6px, env(safe-area-inset-bottom, 0px))" }}
      role="tablist"
      aria-label="التنقل الرئيسي"
      onKeyDown={handleKeyDown}
    >
      {navItems.map(({ id, label, Icon }, idx) => {
        const isActive  = activeId === id;
        const showBadge = id === "cart" && count > 0;

        return (
          <button
            key={id}
            ref={el => { btnRefs.current[idx] = el; }}
            role="tab"
            aria-selected={isActive}
            aria-label={id === "cart" && count > 0 ? `${label} — ${count} عناصر` : label}
            /* مشكلة 67: roving tabindex — التبويب النشط فقط قابل للوصول بـ Tab */
            tabIndex={isActive ? 0 : -1}
            onClick={() => navigate(NAV_ROUTE[id])}
            className="flex flex-col items-center gap-[3px] flex-1 py-1 relative transition-opacity active:opacity-60"
          >
            {/* مشكلة 62: تحريك width يُحرّك layout — استُبدل بـ scaleX (compositor-only) */}
            <div
              className="absolute top-0 start-1/2 h-[2.5px] rounded-full"
              style={{
                width: 22,
                background: GOLD,
                transform: `translateX(-50%) scaleX(${isActive ? 1 : 0})`,
                opacity: isActive ? 1 : 0,
                transition: "transform var(--duration-base) var(--ease-standard), opacity var(--duration-base) var(--ease-standard)",
              }}
            />

            <div className="relative">
              <Icon
                size={20}
                strokeWidth={isActive ? 2 : 1.6}
                className="transition-colors duration-200"
                style={{ color: isActive ? GOLD : INACTIVE }}
              />
              {showBadge && (
                <span
                  className="absolute -top-1.5 -end-1.5 text-white text-[8px] font-bold rounded-full w-[14px] h-[14px] flex items-center justify-center leading-none"
                  style={{ background: BADGE_BG }}
                  aria-hidden="true"
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </div>

            <span
              className="leading-none transition-colors duration-200"
              style={{ fontSize: "var(--text-2xs)", color: isActive ? GOLD : INACTIVE, fontWeight: isActive ? 700 : 500 }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
