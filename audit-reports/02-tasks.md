TASK PLAN — PHASE 2: ARCHITECTURE & CODE
─────────────────────────────────────────
Order: CRITICAL → HIGH → MEDIUM → LOW

 1 | Implement POST /api/v1/orders endpoint and wire CheckoutPage handleSubmit to it — replace the setTimeout mock with a real API call, add try/catch/finally to reset isSubmitting | artifacts/api-server/src/routes/products.ts (new orders.ts), artifacts/vibe-app/src/pages/CheckoutPage.tsx, artifacts/api-server/src/routes/index.ts | P2-009/P2-010: Checkout creates no server record; submit button permanently disabled on failure | Risk: H

 2 | Add optimistic rollback to CartContext — capture pre-mutation snapshot before every setItems call; roll back and toast on API failure in addToCart, removeFromCart, updateQty, clearCart | artifacts/vibe-app/src/context/CartContext.tsx | P2-005: Silent cart state divergence from server on any API failure | Risk: M

 3 | Add optimistic rollback to WishlistContext — same pattern as CartContext; capture snapshot before setWishlist, roll back on .catch | artifacts/vibe-app/src/context/WishlistContext.tsx | P2-006: Wishlist silently diverges from server on API failure | Risk: M

 4 | Replace DEMO_ORDERS with real API data — implement GET /api/v1/orders, fetch with TanStack Query in OrdersPage, show skeleton loading and empty state | artifacts/api-server/src/routes/index.ts, artifacts/vibe-app/src/pages/OrdersPage.tsx, artifacts/api-server/src/routes/ (new orders.ts) | P2-025: Orders page shows fabricated data for all users | Risk: H

 5 | Replace static notifications with real API data — implement GET /api/v1/notifications, fetch with TanStack Query in NotificationsPage | artifacts/api-server/src/routes/index.ts, artifacts/vibe-app/src/pages/NotificationsPage.tsx, artifacts/api-server/src/routes/ (new notifications.ts) | P2-025: Notifications page shows hardcoded static data | Risk: M

 6 | Add per-route ErrorBoundary — wrap each lazy Route in App.tsx with its own ErrorBoundary so a page-level crash isolates to that page and BottomNav remains accessible | artifacts/vibe-app/src/App.tsx, artifacts/vibe-app/src/components/ErrorBoundary.tsx | P2-012: Single root ErrorBoundary kills entire app shell on any page crash | Risk: L

 7 | Validate card fields in CheckoutPage — add validateStep2() that guards cardNum, cardName, cardExp, cardCvv when payMethod === "card"; gate handleSubmit on its result | artifacts/vibe-app/src/pages/CheckoutPage.tsx | P2-014: Card fields are never validated; malformed data will reach payment processor | Risk: L

 8 | Fix coupon discount propagation — lift coupon state to CartPage, pass onApply(discountPct) into CouponInput, apply discount to grandTotal before display and before passing to CheckoutPage | artifacts/vibe-app/src/pages/CartPage.tsx | P2-017: Applied coupon has zero effect on order total | Risk: M

 9 | Replace window.history.back() in ProductDetailPage with Wouter navigation | artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Line: 346 | P2-019: Direct window.history usage is a Wouter anti-pattern, unreliable in proxied/PWA environments | Risk: L

10 | Guard OrderSuccessPage against direct navigation — set/check a sessionStorage flag (nakhba_checkout_complete) in CheckoutPage before navigating; redirect to "/" if absent; clear cart only when flag is present | artifacts/vibe-app/src/pages/OrderSuccessPage.tsx, artifacts/vibe-app/src/pages/CheckoutPage.tsx | P2-020: Any authenticated user can hit /order/success directly and clear their cart | Risk: L

11 | Add post-login redirect — accept returnTo prop in LoginSheet, store intended path before ProtectedRoute redirects to "/", navigate there after successful auth | artifacts/vibe-app/src/components/LoginSheet.tsx, artifacts/vibe-app/src/App.tsx | P2-021: Users redirected from /checkout to login are never returned to /checkout | Risk: M

12 | Add Zod validation to LoginSheet — define loginSchema and registerSchema, validate before calling login/register, show inline field errors without server round-trip | artifacts/vibe-app/src/components/LoginSheet.tsx | P2-016: No client-side validation; every typo requires a server round-trip | Risk: L

13 | Add Zod validation to CheckoutPage Step 1 — replace manual validateStep1 with a Zod addressSchema parsed via safeParse, derive field errors from ZodError | artifacts/vibe-app/src/pages/CheckoutPage.tsx | P2-015: Ad-hoc validation is not type-safe and hard to extend | Risk: L

14 | Add null guards for data.token and data.user in AuthContext login/register — throw before localStorage write if either is missing | artifacts/vibe-app/src/context/AuthContext.tsx — Lines: 63–66, 75–78 | P2-011: Non-null assertion on optional API fields can write "undefined" to localStorage | Risk: L

15 | Move coupon logic server-side — implement POST /api/v1/coupons/validate; remove hardcoded "NAKHBA10" from CartPage | artifacts/vibe-app/src/pages/CartPage.tsx, artifacts/api-server/src/routes/index.ts | P2-018: Hardcoded coupon code is visible in the production bundle | Risk: M

16 | Centralize shipping constants — extract FREE_SHIPPING_THRESHOLD and FLAT_SHIPPING_COST to lib/shippingPolicy.ts and import in CartPage and CheckoutPage | artifacts/vibe-app/src/lib/shippingPolicy.ts (new), artifacts/vibe-app/src/pages/CartPage.tsx, artifacts/vibe-app/src/pages/CheckoutPage.tsx | P2-026: Magic numbers 500/25 duplicated in 3+ locations | Risk: L

17 | Extract ProductDetailPage sub-components — move AccordionRow, ImageGallery, StockBar, DeliveryPills, BuyersCount, ReviewsSection, RelatedProducts, Skeleton into components/product/ directory | artifacts/vibe-app/src/pages/ProductDetailPage.tsx, artifacts/vibe-app/src/components/product/ (new dir) | P2-001: 563-line file, 3× the 200-line ceiling | Risk: M

18 | Extract SearchPage sub-components and hook — move ResultCard, ResultCardList into components/search/, move useSearchProducts into hooks/useSearchProducts.ts | artifacts/vibe-app/src/pages/SearchPage.tsx, artifacts/vibe-app/src/components/search/ (new dir), artifacts/vibe-app/src/hooks/useSearchProducts.ts (new) | P2-002: 498-line file with duplicated result card markup | Risk: M

19 | Remove fake gallery image triplication in ProductDetailPage — until API provides images[], display a single image instead of [image, image, image] | artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Line: 387 | P2-003: Three identical images suggest broken gallery to users | Risk: L

20 | Replace fake stock levels with real data or remove StockBar — add stock_qty field to products API, or hide StockBar with a feature flag until real data is available | artifacts/vibe-app/src/pages/ProductDetailPage.tsx, artifacts/api-server/src/routes/products.ts | P2-027: Pseudo-random stock urgency messaging could be considered a dark pattern | Risk: M

21 | Extract deviceHeaders() to shared utility — move to lib/apiClient.ts and import in CartContext and WishlistContext | artifacts/vibe-app/src/context/CartContext.tsx, artifacts/vibe-app/src/context/WishlistContext.tsx, artifacts/vibe-app/src/lib/apiClient.ts (new) | P2-023: Duplicate deviceHeaders function in two context files | Risk: L

22 | Centralize all API fetch calls through a typed apiFetch utility — create lib/apiFetch.ts that injects Authorization header from localStorage, handles 401 auto-logout; migrate AuthContext, CartContext, WishlistContext, SearchPage | artifacts/vibe-app/src/lib/apiFetch.ts (new), artifacts/vibe-app/src/context/AuthContext.tsx, artifacts/vibe-app/src/context/CartContext.tsx | P2-024: Raw fetch calls scattered across 4 files bypass centralized auth and error handling | Risk: H

23 | Fix DAILY_DEALS_END_MS to use stable session timestamp — initialize in sessionStorage on first load instead of at module import time | artifacts/vibe-app/src/components/Products.tsx — Line: 18 | P2-004: Countdown resets on every page refresh, breaking urgency mechanic | Risk: L

24 | Add clearCart dependency to OrderSuccessPage useEffect — useEffect(..., [clearCart]) to satisfy react-hooks/exhaustive-deps | artifacts/vibe-app/src/pages/OrderSuccessPage.tsx — Line: 52 | P2-013: Missing dependency is latent risk if clearCart becomes unstable | Risk: L

─────────────────────────────────────────
Total: 24 tasks
CRITICAL-sourced: 3 tasks (1, 4 partial, 2–3)
HIGH-sourced: 8 tasks (1, 4, 6, 7, 8, 9, 10, 22)
MEDIUM-sourced: 9 tasks (5, 8, 11, 13, 15, 17, 18, 20, 22)
LOW-sourced: 7 tasks (12, 14, 16, 19, 21, 23, 24)
