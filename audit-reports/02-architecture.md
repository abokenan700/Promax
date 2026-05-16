# Architecture & Code Report — Phase 2
Generated: 2026-05-13

## Scores

| Area | Score | Critical Issues |
|---|---|---|
| Component Architecture | 6/10 | 0 |
| State Management | 5/10 | 1 |
| Async & Error Handling | 4/10 | 1 |
| Forms & Validation | 5/10 | 0 |
| Routing | 7/10 | 0 |
| Monorepo Boundaries | 7/10 | 0 |
| Code Quality | 5/10 | 1 |
| **Overall Architecture Score** | **5/10** | **3** |

---

## Issues — Component Architecture

---

ID: P2-001
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Line: 1–563
Severity: MEDIUM
Root Cause: Page file grew organically. AccordionRow, ImageGallery, StockBar, DeliveryPills, BuyersCount, ReviewsSection, RelatedProducts, and Skeleton are all defined in the same file as the page component.
Impact: File is 563 lines — nearly 3× the 200-line ceiling. Navigation, code review, and future modification are slowed significantly. Any change to a single sub-component forces a full re-read of the entire file.
Recommendation: Extract each named sub-component into its own file under `components/product/`. The page component itself should only wire them together and manage top-level state.

---

ID: P2-002
File: artifacts/vibe-app/src/pages/SearchPage.tsx — Line: 1–498
Severity: MEDIUM
Root Cause: ResultCard, ResultCardList, SuggestionCell, and useSearchProducts hook are all inlined into the page file.
Impact: 498-line page file. The two result card components share duplicated wishlist-toggle markup (lines 80–87 and 155–157) and are not reused elsewhere despite being identical in structure.
Recommendation: Extract `ResultCard`, `ResultCardList` into `components/search/`, move `useSearchProducts` into `hooks/useSearchProducts.ts`.

---

ID: P2-003
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Line: 387
Severity: MEDIUM
Root Cause: Gallery images array is constructed by triplicating the single product image: `[product.image, product.image, product.image]`. No multi-image support exists in the data model.
Impact: Three identical images display in the gallery, giving the impression of a functional gallery. The thumbnail strip and dot indicators render but serve no navigational purpose. Users may perceive the app as broken.
Recommendation: Until the API returns an `images: string[]` field, collapse the gallery to a single image view. Remove the fake triplication.

---

ID: P2-004
File: artifacts/vibe-app/src/components/Products.tsx — Line: 18
Severity: LOW
Root Cause: `DAILY_DEALS_END_MS` is computed once at module load time as `Date.now() + offset`. This means the countdown resets on every page reload/refresh.
Impact: A user who refreshes the page will see the countdown reset from 2h 18m again, breaking trust in the deal urgency mechanic.
Recommendation: Store the deal end timestamp in a stable source (env variable, API response, or sessionStorage initialized once per session) rather than computing it at module import time.

---

## Issues — State Management

---

ID: P2-005
Severity: CRITICAL
File: artifacts/vibe-app/src/context/CartContext.tsx — Lines: 87–89, 94, 105
Root Cause: `apiAddToCart`, `apiRemoveFromCart`, and `apiClearCart` failures are swallowed with `.catch(() => {})` (remove, clear) or show a toast but do not roll back the local state (add). The optimistic update has already mutated `items` in localStorage before the API call is even fired.
Impact: If the server rejects or is unavailable, the client cart diverges from the server cart permanently. On next session with a different device, the server state is correct but the localStorage state may be wrong or vice versa. Silent data corruption with no recovery path.
Recommendation: Capture the pre-mutation state snapshot before each `setItems` call. In the `.catch`, call `setItems(snapshot)` to roll back. Add an error toast on rollback so the user knows the sync failed.

---

ID: P2-006
File: artifacts/vibe-app/src/context/WishlistContext.tsx — Lines: 62–66
Severity: HIGH
Root Cause: Same pattern as cart — `apiRemoveFromWishlist` and `apiAddToWishlist` failures are caught with `.catch(() => {})`. Local state has already been updated before the API call is awaited.
Impact: Wishlist silently diverges from server state on API failure. User believes an item is wishlisted/removed when the server reflects the opposite.
Recommendation: Same rollback pattern as P2-005. Capture snapshot before `setWishlist`, roll back and toast on `.catch`.

---

ID: P2-007
File: artifacts/vibe-app/src/context/CartContext.tsx — Line: 108–109
Severity: LOW
Root Cause: `count` and `total` are recomputed with `Array.reduce` on every render of `CartProvider`. The provider re-renders whenever `items` changes, which is appropriate, but these values could be memoized.
Impact: Negligible performance impact for typical cart sizes (<20 items). Not a current bottleneck but worth noting for completeness.
Recommendation: Wrap with `useMemo(() => items.reduce(...), [items])` for both `count` and `total`.

---

ID: P2-008
File: artifacts/vibe-app/src/context/WishlistContext.tsx — Line: 56–68
Severity: LOW
Root Cause: `toggleWishlist` is defined with `useCallback` but lists `wishlist` (the full array) in its dependency array. Every time any item is added or removed, the entire `wishlist` array is a new reference, causing `toggleWishlist` to be a new function reference on every mutation.
Impact: Any component consuming `toggleWishlist` via `useWishlist()` that is wrapped in `React.memo` will re-render unnecessarily after every wishlist change. Currently no memoized consumers, so no observed impact, but this is a latent stability risk.
Recommendation: Refactor to use a functional updater pattern for `setWishlist` and remove `wishlist` from the `useCallback` dependency array. Use a ref for the existence check if needed.

---

## Issues — Async & Error Handling

---

ID: P2-009
Severity: CRITICAL
File: artifacts/vibe-app/src/pages/CheckoutPage.tsx — Lines: 115–120
Root Cause: `handleSubmit` is an `async` function that only executes `await new Promise((r) => setTimeout(r, 1200))` then writes to `sessionStorage` and navigates. There is no API call. No order is created. No payment is processed. The checkout flow is entirely mocked.
Impact: The checkout is non-functional in production. Users complete the flow believing an order has been placed, but no order record exists in the database. `clearCart()` is called on the success page, destroying cart state without any server-side record.
Recommendation: Implement a `POST /api/v1/orders` endpoint. Call it from `handleSubmit` with the address, payment method, and cart items. Wrap in `try/catch/finally` to reset `isSubmitting`. Only navigate to success on a 201 response.

---

ID: P2-010
File: artifacts/vibe-app/src/pages/CheckoutPage.tsx — Lines: 115–120
Severity: HIGH
Root Cause: `handleSubmit` sets `setIsSubmitting(true)` but there is no `finally` block or error handler to reset it. If the user navigates back from OrderSuccessPage to CheckoutPage (browser back), the page mounts fresh — so this is only a problem in the current session. However, once `handleSubmit` is wired to a real API, any failure will leave the submit button permanently disabled.
Impact: Currently masked by the mock flow. After P2-009 is fixed, any network failure will brick the checkout button for the session.
Recommendation: Wrap `handleSubmit` in try/catch/finally with `setIsSubmitting(false)` in the `finally` block.

---

ID: P2-011
File: artifacts/vibe-app/src/context/AuthContext.tsx — Lines: 65, 78
Severity: MEDIUM
Root Cause: After login and register, the code uses non-null assertions `data.token!` and `data.user!` to write to localStorage and set user state. The TypeScript type for `data` marks both `token` and `user` as optional (`token?: string; user?: AuthUser`).
Impact: If the API returns a successful HTTP status but a malformed response body (missing `token` or `user`), `localStorage.setItem(TOKEN_KEY, undefined!)` writes the string `"undefined"` to localStorage. On the next app load, `fetch` sends `Authorization: Bearer undefined`, which the server rejects, and the client removes the token — but the user saw themselves as logged in momentarily.
Recommendation: Add explicit guards: `if (!data.token || !data.user) throw new Error("استجابة غير متوقعة من الخادم");` before the localStorage write.

---

ID: P2-012
File: artifacts/vibe-app/src/main.tsx — Line: 30; artifacts/vibe-app/src/App.tsx — Line: 109
Severity: HIGH
Root Cause: There is only one `ErrorBoundary` at the root (`main.tsx`) and one wrapping the `<Switch>` in `App.tsx`. No per-route or per-section error boundary exists.
Impact: A render error in any lazily-loaded page (e.g., `ProductDetailPage`, `CheckoutPage`) will be caught by the single root boundary and replace the entire app shell with the error UI, including the BottomNav. Users lose navigation context and cannot recover to another page without a full page reload.
Recommendation: Wrap each `<Route>` (or at minimum the `<Suspense>`) with its own `<ErrorBoundary>` so that a page-level crash isolates to that page and the nav remains operable.

---

ID: P2-013
File: artifacts/vibe-app/src/pages/OrderSuccessPage.tsx — Line: 52–55
Severity: LOW
Root Cause: `useEffect(() => { clearCart(); ... }, [])` has an empty dependency array but calls `clearCart` from context. ESLint `react-hooks/exhaustive-deps` would flag this. `clearCart` is a stable `useCallback` reference so there's no functional bug in practice.
Impact: No observable bug. However, if `clearCart` is ever made non-stable (e.g., dependency changes), this would silently stop working.
Recommendation: Add `clearCart` to the dependency array: `useEffect(() => { clearCart(); ... }, [clearCart])`.

---

## Issues — Forms & Validation

---

ID: P2-014
File: artifacts/vibe-app/src/pages/CheckoutPage.tsx — Lines: 104–113, 189–198
Severity: HIGH
Root Cause: When `payMethod === "card"`, the fields `cardNum`, `cardName`, `cardExp`, `cardCvv` are rendered and editable but never validated — not in `validateStep1` (which only runs for Step 1 address fields) and not in `handleSubmit`. A user can proceed to "order success" with empty or malformed card fields.
Impact: In the current mock flow, this is cosmetic. After a real payment integration is added, unvalidated card data will reach the payment processor and produce opaque errors rather than clear user feedback.
Recommendation: Add a `validateStep2()` function that checks card fields when `payMethod === "card"`. Gate `handleSubmit` on its result. Use Zod schema for the card shape.

---

ID: P2-015
File: artifacts/vibe-app/src/pages/CheckoutPage.tsx — Lines: 104–113
Severity: MEDIUM
Root Cause: Validation in `validateStep1` is implemented with manual string checks. No Zod schema is used. There is no client-side Zod validation anywhere in the checkout flow.
Impact: Validation logic is ad-hoc and not type-safe. Adding new fields requires updating the manual validation function. Error message strings are hardcoded Arabic literals with no i18n structure.
Recommendation: Define a `checkoutSchema` with Zod, integrate with React Hook Form, and derive field error messages from the schema.

---

ID: P2-016
File: artifacts/vibe-app/src/components/LoginSheet.tsx — Lines: 46–63
Severity: MEDIUM
Root Cause: `LoginSheet` has no client-side validation. The form `noValidate` attribute suppresses browser validation. No minimum length check, no email format check, no password strength check. All validation is delegated to the API server.
Impact: A user who submits an empty form makes a round-trip to the server before seeing any error. The UX lag is noticeable. No Zod schema means TypeScript cannot enforce the shape of submitted data.
Recommendation: Add a Zod schema for both login and register modes. Validate before calling `login`/`register`. Show inline errors without a server round-trip.

---

ID: P2-017
File: artifacts/vibe-app/src/pages/CartPage.tsx — Lines: 39–50
Severity: HIGH
Root Cause: `CouponInput` applies the coupon code visually (shows "NAKHBA10 — خصم ١٠٪ ✓") but the `applied` state is local to `CouponInput` and is never communicated back to `CartPage`. The `grandTotal` displayed in the summary and on the checkout button never changes when a coupon is applied.
Impact: Users are shown a success message for a coupon that has no effect on their order total. This is functionally deceptive — the displayed total at checkout time is incorrect, and the mock order would record the wrong price.
Recommendation: Lift coupon state to `CartPage`. Pass a `onApply(discountPct: number)` callback into `CouponInput`. Apply the discount to `grandTotal` before display and before passing to `CheckoutPage`.

---

ID: P2-018
File: artifacts/vibe-app/src/pages/CartPage.tsx — Line: 41
Severity: MEDIUM
Root Cause: The coupon code `"NAKHBA10"` and its discount value `10` (percent) are magic literals hardcoded directly in the component logic.
Impact: Adding, removing, or changing valid coupon codes requires editing component source. No abstraction layer exists. If this file is minified/shipped, the coupon code is visible in the bundle.
Recommendation: Move valid coupon definitions to a server-side validation endpoint (`POST /api/v1/coupons/validate`). The client should send the code and receive the discount value, never hard-coding valid codes.

---

## Issues — Routing

---

ID: P2-019
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Line: 346
Severity: HIGH
Root Cause: `handleBack` calls `window.history.back()` and `window.history.length` directly instead of using Wouter's navigation primitives.
Impact: Direct `window.history` manipulation bypasses Wouter's virtual history stack. In a Replit preview (proxied iframe) or PWA context, `window.history.length` may be unreliable. This also creates a tight coupling to the browser environment, making the component non-testable in isolation.
Recommendation: Replace with Wouter's `useLocation` navigate: keep a ref to the previous location, or use a `from` query param to track the back-target. As a simpler fix: `navigate("~-1")` uses Wouter's relative navigation if supported, otherwise `navigate("/")` as the fallback is sufficient.

---

ID: P2-020
File: artifacts/vibe-app/src/pages/OrderSuccessPage.tsx — Lines: 43, 52–54
Severity: HIGH
Root Cause: `/order/success` is a `ProtectedRoute` (requires login), but there is no guard ensuring the user arrived via the checkout flow. Any authenticated user can navigate to `/order/success` directly. On mount, `clearCart()` is called unconditionally, wiping the cart.
Impact: A logged-in user who bookmarks `/order/success` and visits it will have their cart silently cleared. The page also displays a generated order number (`Date.now()`) and payment method from `sessionStorage`, which may be stale or missing from a previous session.
Recommendation: Set a short-lived `sessionStorage` flag (e.g., `nakhba_checkout_complete = "1"`) in `handleSubmit` before navigation. In `OrderSuccessPage`, check for this flag on mount; if absent, redirect to `/`. Clear the flag after reading.

---

ID: P2-021
File: artifacts/vibe-app/src/App.tsx — Lines: 128–131
Severity: MEDIUM
Root Cause: After a successful login via `LoginSheet`, there is no redirect to a protected destination the user may have been trying to reach. The user stays on the current page (AccountPage, OrdersPage, etc.) which then re-renders with the new auth state. However, if the user clicked a deep link to `/checkout` and was redirected to `/` by `ProtectedRoute`, after login they remain on `/` rather than returning to `/checkout`.
Impact: Users who are redirected from `/checkout` to login and then log in are not returned to `/checkout`. They must manually navigate back, likely causing cart abandon.
Recommendation: Pass the intended `returnTo` path through `LoginSheet` props. After successful auth, call `navigate(returnTo ?? "/account")`.

---

## Issues — Monorepo Boundaries

---

ID: P2-022
File: artifacts/vibe-app/src/context/CartContext.tsx — Lines: 46–63; artifacts/vibe-app/src/context/WishlistContext.tsx — Lines: 32–43
Severity: MEDIUM
Root Cause: Both contexts construct raw `fetch` calls against `API_BASE` directly. The `@workspace/api-client-react` package exists and is used elsewhere (e.g., `useGetProducts`), but the cart and wishlist API calls bypass it entirely.
Impact: API contract changes (URL, request shape, auth headers) must be updated in two places: the generated api-client and these manual fetch calls. Type safety is lost — the request/response types are cast with `as`, not validated against generated types.
Recommendation: Extend the api-client package with cart and wishlist mutations, or at minimum extract a typed `apiClient.ts` utility in the vibe-app that wraps all `fetch` calls uniformly.

---

ID: P2-023
File: artifacts/vibe-app/src/context/CartContext.tsx — Lines: 42–44; artifacts/vibe-app/src/context/WishlistContext.tsx — Lines: 28–30
Severity: LOW
Root Cause: `deviceHeaders()` is defined identically in both `CartContext.tsx` and `WishlistContext.tsx`:
```ts
function deviceHeaders(): HeadersInit {
  return { "Content-Type": "application/json", "x-device-id": getDeviceId() };
}
```
(The wishlist version omits `Content-Type`.)
Impact: Code duplication. Any change to the header structure must be made in both files.
Recommendation: Extract to `lib/apiClient.ts` or `lib/deviceId.ts` as a shared `getDeviceHeaders()` export.

---

ID: P2-024
File: artifacts/vibe-app/src/context/AuthContext.tsx — Lines: 50–54; artifacts/vibe-app/src/pages/SearchPage.tsx — Lines: 187–192
Severity: MEDIUM
Root Cause: `AuthContext` makes raw `fetch` calls for `/auth/me`, `/auth/login`, `/auth/register`. `SearchPage` makes a raw `fetch` for `/products?q=...` instead of using `useGetProducts`. Neither uses the `@workspace/api-client-react` layer.
Impact: Auth token is not attached via the centralized api-client — it's attached manually per-call. Adding global error handling, request logging, or token refresh logic requires modifying each raw `fetch` site independently.
Recommendation: Centralize all authenticated requests through a single `apiFetch(path, options)` utility that reads the token from localStorage, injects the `Authorization` header, and handles 401 responses globally (e.g., auto-logout).

---

## Issues — Code Quality

---

ID: P2-025
Severity: CRITICAL
File: artifacts/vibe-app/src/pages/OrdersPage.tsx — Lines: 18–50; artifacts/vibe-app/src/pages/NotificationsPage.tsx — Lines: 17–24; artifacts/vibe-app/src/pages/AccountPage.tsx — Line: 95
Root Cause: Three user-facing data pages display hardcoded static demo data instead of API-fetched content:
- `OrdersPage`: `DEMO_ORDERS` array (3 hardcoded orders) — API never called.
- `NotificationsPage`: `INITIAL` array (6 hardcoded notifications) — API never called.
- `AccountPage`: `demoPoints = 340` hardcoded loyalty points.
Impact: These pages are non-functional in production. Authenticated users see fabricated order history and notifications that do not correspond to their account. Trust is broken if a user notices the data never changes between accounts.
Recommendation: Implement `GET /api/v1/orders`, `GET /api/v1/notifications` endpoints and fetch them with TanStack Query, displaying real data. Replace `demoPoints` with a real loyalty field from the user profile.

---

ID: P2-026
File: artifacts/vibe-app/src/pages/CartPage.tsx — Lines: 13, 230–231; artifacts/vibe-app/src/pages/CheckoutPage.tsx — Lines: 101–102
Severity: MEDIUM
Root Cause: The free-shipping threshold (`500`) and flat shipping cost (`25`) are magic numbers repeated in at least three separate locations: `FreeShippingBar` (CartPage), `CartPage` main component, and `CheckoutPage`.
Impact: Changing the shipping policy requires finding and updating each occurrence manually. Risk of partial updates creating inconsistent UX (e.g., bar says free shipping at 500, checkout charges 25 for a 501 order).
Recommendation: Define `FREE_SHIPPING_THRESHOLD = 500` and `FLAT_SHIPPING_COST = 25` as named constants in `lib/shippingPolicy.ts` and import them in all three locations.

---

ID: P2-027
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Lines: 138–160, 180–191
Severity: MEDIUM
Root Cause: `StockBar` generates stock percentage and count from `productId * 17 + 31 % 70`. `BuyersCount` uses `product.sales` (real field) but `StockBar`'s stock level is entirely synthetic.
Impact: Users may make urgency-driven purchase decisions based on fabricated stock levels. "3 قطع متبقية فقط!" is shown for products that may have unlimited inventory. This could be considered a dark pattern in a production context.
Recommendation: Either add a real `stock_qty` field to the products API, or remove the stock indicator entirely until real data is available. Do not present pseudo-random values as real inventory.

---

ID: P2-028
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Lines: 21–39
Severity: LOW
Root Cause: `ReviewsSection` generates reviews with deterministic pseudo-random data from `productId`. Rating distribution (`dist = [87, 9, 3, 1, 0]`) is identical for all products. `totalReviews` is derived as `product.sales / 8`.
Impact: All products show the same 5-star rating distribution. The "show all reviews" button links to no page. This is acceptable as scaffolding but must not reach production users.
Recommendation: Implement a reviews API or mark the section as "coming soon" with a clear placeholder rather than presenting synthetic reviews as real user content.

---

ID: P2-029
File: artifacts/vibe-app/src/pages/CheckoutPage.tsx — Line: 117
Severity: LOW
Root Cause: `handleSubmit` contains `await new Promise((r) => setTimeout(r, 1200))` — a 1.2-second artificial delay to simulate a network call.
Impact: Even after a real API is wired in, this delay may be left in by oversight, adding 1.2 seconds to every checkout submission. The magic `1200` has no semantic name.
Recommendation: Remove the fake delay when implementing the real API call. If a minimum UX delay is desired, name it `const MIN_SUBMIT_FEEDBACK_MS = 800` and use `Promise.all([apiCall, sleep(MIN_SUBMIT_FEEDBACK_MS)])`.

---

ID: P2-030
File: artifacts/vibe-app/src/lib/colorMap.ts (not read but referenced via ProductColorPicker); artifacts/vibe-app/src/components/ProductColorPicker.tsx
Severity: LOW
Root Cause: ⚠️ `colorMap.ts` was not fully read. Referenced by `ProductColorPicker`, which maps product color strings to hex values. If the map is incomplete, colors silently fall back to a default.
Impact: Products with unmapped color names display incorrect swatches. Cannot fully assess without reading the file.
Recommendation: Flag for review — ensure `colorMap.ts` covers all color values present in the product catalog, and add a fallback indicator (e.g., a striped pattern) for unmapped colors rather than a silent fallback.

---

## Summary

Total issues: **30**
CRITICAL: **3** | HIGH: **8** | MEDIUM: **12** | LOW: **7**

### Critical issues require immediate attention before any production traffic:
1. **P2-009** — Checkout submits nothing to any server. No order is ever created.
2. **P2-005** — Cart mutations have no rollback on API failure. Silent data corruption.
3. **P2-025** — Orders, notifications, and loyalty points are hardcoded demo data. Never real.

### High issues block a trustworthy beta:
- P2-006 (wishlist rollback), P2-010 (isSubmitting never reset), P2-012 (single root error boundary), P2-014 (card fields unvalidated), P2-017 (coupon not applied to total), P2-019 (window.history Wouter anti-pattern), P2-020 (success page clears cart unconditionally), P2-027 (fake stock levels).
