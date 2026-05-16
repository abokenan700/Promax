# Ecommerce Flows Report — Phase 3
Generated: 2026-05-13

---

## Scores

| Area | Score | Critical Issues |
|---|---|---|
| Cart System | 7/10 | 1 |
| Checkout Flow | 6/10 | 0 |
| Product Experience | 5/10 | 2 |
| Search & Filter | 6/10 | 0 |
| Auth & Session | 4/10 | 1 |
| Conversion Psychology | 6/10 | 0 |
| **Overall Commerce Score** | **5.7/10** | **4** |

---

## Benchmark Gap

| Criterion | Status | Notes |
|---|---|---|
| Checkout ≤ 4 steps | ✅ | 2 steps (Address → Payment) + Success page = 3 total |
| Trust signals above fold | ✅ | Trust pills on product page, trust row in checkout CTA |
| Filter state persists on back-nav | ❌ | Filters/sort are component state only — not in URL; reset on back-navigation |
| OOS before add-to-cart | ❌ | No `stock` field exists in Product schema; add-to-cart is always enabled |
| Arabic validation errors | ✅ | Zod error messages are fully in Arabic in checkout form |

---

## Issues — Cart System

---

```
ID: P3-001
File: artifacts/vibe-app/src/context/CartContext.tsx — Line: 115-119
Severity: CRITICAL
Journey: Quantity change in cart
Friction: User increases/decreases quantity; change is reflected in UI but is NEVER sent to the server.
          The `updateQty` function only calls `setItems` with no corresponding API call.
          On any other device or after a server-side re-sync, the qty change is lost silently.
Business Impact: Orders may be placed with incorrect quantities; server-side cart permanently
                 out of sync with client-side cart after any quantity change.
Recommendation: Add `apiFetch("/cart/:item_id", { method: "PUT", body: { qty } })` call inside
                `updateQty`, mirroring the snapshot/rollback pattern used in `addToCart`.
```

```
ID: P3-002
File: artifacts/vibe-app/src/context/CartContext.tsx — Line: 106-113
Severity: HIGH
Journey: Remove item from cart (multi-color product)
Friction: `apiRemoveFromCart` calls `DELETE /cart/product/:productId` which deletes ALL
          colors of a product (server route line 101-108 in cart.ts). But the cart key is
          `${item.id}-${item.color}`, meaning a user could have the same product in two colors.
          Removing one color removes both from the server while the client only removes one.
Business Impact: Silent data corruption — server cart differs from client cart after removing
                 one color variant of a product that appears in multiple colors.
Recommendation: Change API call to use item-level cart id (POST /cart returns the serial `id`).
                Store `cartItemServerId` on each CartItem and call `DELETE /cart/:id` instead.
```

```
ID: P3-003
File: artifacts/vibe-app/src/context/CartContext.tsx — Line: 115
Severity: HIGH
Journey: Add-to-cart from any product surface
Friction: No maximum quantity limit is enforced. User can add 999 units of any item.
          There is no `stock` field checked on the client or enforced on the server.
Business Impact: Overselling risk. User expects realistic quantity bounds.
Recommendation: Enforce a configurable MAX_QTY (e.g., 10) in `updateQty` and `addToCart`.
                Display "الحد الأقصى X وحدة" when the ceiling is hit.
```

```
ID: P3-004
File: artifacts/vibe-app/src/context/CartContext.tsx — Line: 69-70
       artifacts/api-server/src/routes/cart.ts — Line: 10
Severity: HIGH
Journey: Login → return to cart
Friction: Cart is identified by `device_id` (anonymous). Order history requires JWT (user auth).
          When a guest user fills their cart then logs in, their cart items remain on the guest
          device_id and are never merged into the authenticated user's session.
          The server has no cart-merge endpoint.
Business Impact: Cart abandonment after login. User must re-add items after authenticating,
                 which is a proven high-friction conversion killer.
Recommendation: On login success in AuthContext, call a `POST /cart/merge` endpoint that
                transfers device_id cart rows to the authenticated user's account.
```

```
ID: P3-005
File: artifacts/vibe-app/src/pages/CartPage.tsx — Line: 257
Severity: MEDIUM
Journey: Navigate to empty cart
Friction: Empty cart state is well designed, but shows no recently viewed or trending items
          to redirect browse intent. User hits a dead end.
Business Impact: Missed re-engagement opportunity; user likely exits app entirely.
Recommendation: Surface 3–4 recently viewed products (already tracked in `nakhba_recent_viewed`)
                below the empty state CTA.
```

---

## Issues — Checkout Flow

---

```
ID: P3-006
File: artifacts/vibe-app/src/App.tsx — Line: 134-136
       artifacts/vibe-app/src/context/AuthContext.tsx — Line: 43-53
Severity: HIGH
Journey: Unauthenticated user clicks "إتمام الطلب" from cart
Friction: `ProtectedRoute` redirects to "/" when user is not logged in. No redirect destination
          is saved (no `?redirect=/checkout` or sessionStorage key). After login, user lands
          on the homepage and must navigate back to cart → checkout manually.
          Cart items are preserved in localStorage, but the intent is broken.
Business Impact: A confirmed conversion path is interrupted with no recovery. High drop-off.
Recommendation: In `ProtectedRoute`, save `window.location.pathname` to sessionStorage before
                redirecting. After login completes in `AuthContext`, read the saved path and
                navigate there. Alternatively open the LoginSheet in-place on the cart page.
```

```
ID: P3-007
File: artifacts/vibe-app/src/pages/CheckoutPage.tsx — Line: 208-233
Severity: HIGH
Journey: Checkout Step 1 — Address entry
Friction: No order summary is visible in step 1. The user fills in their delivery address
          with no visibility of what they are ordering or the total amount.
          The only cost reference is the shipping hint at the bottom of step 1.
Business Impact: Uncertainty about order contents increases abandonment. User may need to
                 navigate back to cart to verify, breaking the checkout flow.
Recommendation: Add a collapsible "ملخص الطلب" accordion at the top of step 1 showing
                item count, subtotal, and grand total — mirroring the summary in step 2.
```

```
ID: P3-008
File: artifacts/vibe-app/src/pages/CheckoutPage.tsx — Line: 178-183
Severity: HIGH
Journey: Order submission failure
Friction: When `handleSubmit` throws (network error, server error), only a toast is shown.
          There is no explicit retry CTA, no explanation of next steps, and no way to recover
          partial payment attempt. The button re-enables but there is no visual confirmation
          that a retry is expected.
Business Impact: User may not realize they can simply tap the button again, or may double-submit.
Recommendation: On error, show an inline error panel below the CTA with a clear "حاول مجدداً"
                button and a note to check their payment method. Log error type for debugging.
```

```
ID: P3-009
File: artifacts/vibe-app/src/pages/CheckoutPage.tsx — Line: 244-252
Severity: MEDIUM
Journey: Payment step — Apple Pay / مدى selection
Friction: Apple Pay / مدى is listed as a payment option and visually selectable, but has
          zero integration — selecting it behaves identically to COD. No native payment sheet
          is invoked. The order is placed with `payment_method: "apple"` but no payment
          is collected.
Business Impact: Critical trust violation if deployed in production. Users expect Apple Pay
                 to authenticate immediately; instead the order silently completes with no
                 payment collected.
Recommendation: Either remove this option until properly integrated (PayTabs, Moyasar, etc.)
                or mark it as "قريباً" and disable selection.
```

```
ID: P3-010
File: artifacts/vibe-app/src/pages/CheckoutPage.tsx — Line: 256
Severity: MEDIUM
Journey: Credit card entry
Friction: The card number field strips non-digits and limits to 16 chars, but shows no
          visual grouping (no "0000 0000 0000 0000" formatting). The user sees a raw
          digit string. CVV label in English ("CVV") without Arabic explanation.
Business Impact: Friction and potential user confusion leading to card entry errors.
Recommendation: Format card number with spaces every 4 digits on input (use a masked input
                or manual replace). Add Arabic hint "رمز الأمان (٣ أرقام خلف البطاقة)".
```

```
ID: P3-011
File: artifacts/vibe-app/src/pages/CheckoutPage.tsx — Line: 220-224
Severity: LOW
Journey: Address entry
Friction: The address form has no postal/zip code field and no apartment/floor/building
          number field. Saudi addresses require these for accurate delivery.
Business Impact: Delivery failures and returned shipments for dense urban addresses.
Recommendation: Add optional "الرمز البريدي" (9-digit KSA format) and
                "رقم الشقة/الطابق" fields.
```

---

## Issues — Product Experience

---

```
ID: P3-012
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Line: 241-246
Severity: CRITICAL
Journey: Browse product images on mobile
Friction: The gallery swipe direction uses LTR logic: `delta < -40` (swipe left) advances
          to the NEXT image. On an RTL Arabic app, the natural gesture is swipe RIGHT = next.
          This is the opposite of what Arabic users expect (consistent with iOS/Android RTL behavior).
Business Impact: Users swiping right to browse images go backwards (or do nothing if on the
                 first image), breaking a core product browsing gesture. This is the most
                 used interaction on a product page on mobile.
Recommendation: Invert the swipe direction logic:
                `if (delta > 40 && active < n - 1) setActive(a => a + 1)` (swipe right = next)
                `if (delta < -40 && active > 0)    setActive(a => a - 1)` (swipe left = prev)
```

```
ID: P3-013
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Line: 524
       artifacts/api-server/src/routes/products.ts
Severity: CRITICAL
Journey: Add out-of-stock product to cart
Friction: The `Product` schema has no `stock` or `in_stock` field. There is no out-of-stock
          state anywhere in the UI. The "أضف للسلة" and "اشتري الآن" buttons are always
          active regardless of inventory. Users can add items that cannot be fulfilled.
Business Impact: Orders placed for unavailable items → cancellations → trust erosion.
                 Violates the Noon-level benchmark criterion directly.
Recommendation: Add `stock: number` to the products schema and seed data. In ProductDetailPage,
                disable add-to-cart / buy-now and show "نفد المخزون" badge when stock === 0.
                Show "آخر X قطع!" scarcity signal when stock < 5.
```

```
ID: P3-014
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Line: 524
Severity: HIGH
Journey: View product image gallery
Friction: `galleryImages` is always built as `[product.image]` — a single-element array.
          The gallery supports multiple images (dot indicators, thumbnail rail, swipe) but
          this feature is entirely unused because the Product schema has only one `image` field.
Business Impact: Product presentation quality significantly below Noon standard. Fashion/luxury
                 products require multi-angle images to drive conversion.
Recommendation: Add `images: string[]` array field to the Product schema. Populate with 2–4
                images per product. Update gallery to use `product.images ?? [product.image]`.
```

```
ID: P3-015
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Line: 190-208
Severity: HIGH
Journey: Read product reviews before purchase
Friction: All reviews are deterministic pseudo-random generated from two hardcoded arrays
          (REVIEWER_NAMES, REVIEW_TEXTS). No reviews are fetched from a database.
          The "عرض جميع التقييمات" button leads nowhere (no route exists).
Business Impact: Fabricated reviews are a legal and reputational liability. If discovered,
                 total trust collapse. Also blocks genuine social proof from accumulating.
Recommendation: Build a real reviews endpoint (`GET/POST /api/v1/products/:id/reviews`),
                show real reviews. Disable the fake generation. Gate review submission on
                verified purchase (order history check).
```

```
ID: P3-016
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Line: 598-606
Severity: MEDIUM
Journey: Select product variant before adding to cart
Friction: Color selection works, but there is no size selection (S/M/L/XL for fashion,
          or volume for fragrance). The `Product` type has `colors` but no `sizes` field.
          For the apparent product catalog (fashion, fragrance, accessories), size is critical.
Business Impact: Users add items without size confirmation → high return rate → operational cost.
Recommendation: Add `sizes: string[]` to the Product schema. Implement a size picker
                (similar to ProductColorPicker). Require size selection before add-to-cart
                if sizes exist.
```

---

## Issues — Search & Filter

---

```
ID: P3-017
File: artifacts/vibe-app/src/pages/SearchPage.tsx — Line: 218-222
Severity: HIGH
Journey: Apply filters → tap a product → press back → expect filters to remain
Friction: `sortKey`, `filters`, and `viewMode` are React `useState` — not URL params.
          Navigating to a product page and pressing back destroys the filter state entirely.
          User must re-apply all filters from scratch.
Business Impact: Direct conversion loss. Filter state persistence is a Noon-level benchmark
                 requirement and is explicitly listed in the audit criteria.
Recommendation: Encode sort and filters in URL search params (`?sort=price_asc&minRating=4`).
                Read initial state from `useSearch()`. Update URL on every filter change
                (use `navigate` with `replace: true`). This also enables shareable filtered URLs.
```

```
ID: P3-018
File: artifacts/api-server/src/routes/products.ts — Line: 34-37
Severity: HIGH
Journey: Search in Arabic
Friction: Search uses `ilike(productsTable.name, term)` — a case-insensitive LIKE on raw text.
          PostgreSQL `ilike` is NOT Unicode-aware by default and does not handle Arabic:
          - Definite article: "العطور" will not match "عطور"
          - Tatweel, diacritics: "عطـور" will not match "عطور"
          - Root-based search: "عطر" will not match "العطور" or "عطور"
Business Impact: Arabic search quality is fundamentally broken for any word with ال prefix
                 or diacritic variation — which is the majority of Arabic product names.
Recommendation: Normalize search input server-side: strip ال prefix, remove diacritics/tatweel.
                Alternatively, use PostgreSQL full-text search with an Arabic text search config
                or add a normalized_name column for searching.
```

```
ID: P3-019
File: artifacts/vibe-app/src/pages/SearchPage.tsx — Line: 294
Severity: MEDIUM
Journey: Active search with results — apply filters
Friction: The ControlsBar (sort/filter) only appears when `!loading && results.length > 0`.
          If a search returns 0 results, no filter controls appear. User cannot adjust filters
          to expand results from the empty state — they must guess that clicking "إعادة ضبط الفلاتر"
          (which appears in empty state) is the fix.
Business Impact: Users abandon search instead of adjusting filters when facing zero results.
Recommendation: Show ControlsBar even when results.length === 0 (if filters are active).
                Change condition to `!loading && (results.length > 0 || hasActiveFilters)`.
```

```
ID: P3-020
File: artifacts/vibe-app/src/pages/SearchPage.tsx — Line: 203
Severity: MEDIUM
Journey: Deep-link to search with a query (?q=عطور)
Friction: `qParam` correctly reads `?q=` from URL on initial load and sets `query` state.
          However, if the URL changes externally (e.g., user navigates brand → search),
          `useState(qParam)` only reads the initial value. Subsequent URL changes are
          not picked up because there is no `useEffect` syncing `qParam → setQuery`.
Business Impact: Brand chips and trending chips navigate to `/search?brand=CHANEL`, which
                 works on first load but not if the user is already on the search page.
Recommendation: Add `useEffect(() => { setQuery(qParam); }, [qParam])` to sync URL param
                changes into the query state.
```

---

## Issues — Auth & Session

---

```
ID: P3-021
File: artifacts/vibe-app/src/context/AuthContext.tsx — Line: 31-39
Severity: CRITICAL
Journey: Token expires mid-session → user tries to place order
Friction: The token is validated once at app startup (`/auth/me`). There is no periodic
          re-validation and no response interceptor watching for 401 errors. When a JWT
          expires mid-session, the next authenticated API call (order POST) silently fails
          with a 401, which surfaces only as a generic toast error ("تعذّر تأكيد الطلب").
          The user has no indication their session expired.
Business Impact: User loses order data at the final conversion point with no recovery path.
                 They cannot retry without knowing they must re-login first.
Recommendation: Add a 401 response interceptor in `apiFetch`. When a 401 is detected,
                clear the token, set user to null, save the redirect destination, show
                "انتهت جلستك — يرجى تسجيل الدخول مجدداً", then redirect to login.
```

```
ID: P3-022
File: artifacts/vibe-app/src/App.tsx — Line: 40-51
Severity: HIGH
Journey: Unauthenticated user initiates checkout
Friction: `ProtectedRoute` redirects to `"/"` with no saved return URL. The user must:
          1. Notice they've been redirected to the home page
          2. Find the login entry point (bottom nav → account)
          3. Log in
          4. Navigate back to cart
          5. Tap "إتمام الطلب" again
          Five steps to recover from a single auth check failure.
Business Impact: Extremely high dropout rate at the most critical conversion moment.
Recommendation: Before redirecting, save `window.location.pathname + window.location.search`
                to sessionStorage. After successful login in `AuthContext`, read and navigate
                to the saved path, then clear it.
```

```
ID: P3-023
File: artifacts/vibe-app/src/context/AuthContext.tsx
       artifacts/api-server/src/routes/auth.ts
Severity: MEDIUM
Journey: Account management
Friction: There is no "forgot password" or password reset flow anywhere in the codebase.
          A user who forgets their password has no recovery path — they cannot log in
          and therefore cannot access their order history or complete a checkout.
Business Impact: Permanent lockout for any user who forgets their password. Lost repeat customers.
Recommendation: Implement `/auth/forgot-password` endpoint (email-based OTP or link).
                Add "نسيت كلمة المرور؟" link in the login form.
```

```
ID: P3-024
File: artifacts/vibe-app/src/context/AuthContext.tsx — Line: 68-71
Severity: MEDIUM
Journey: User logs out
Friction: `logout()` clears the token and user state but does NOT clear the cart.
          After logout, the guest device_id cart is empty (items were associated with the
          logged-in user's device) but `nakhba_cart` in localStorage may still hold stale items.
Business Impact: After logout and re-login (different user on same device), previous user's
                 cart items may re-appear. Privacy concern on shared devices.
Recommendation: Call `clearCart()` inside the `logout` function, and/or clear
                `nakhba_cart` from localStorage on logout.
```

---

## Issues — Conversion Psychology

---

```
ID: P3-025
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — (entire file)
       artifacts/api-server/src/routes/products.ts
Severity: HIGH
Journey: View product → decide to buy
Friction: No scarcity signals exist anywhere. There is no `stock` field in the Product schema,
          so "آخر ٣ قطع" or "متبقٍ ٥ فقط" banners are impossible to implement.
          Scarcity is one of the top-3 conversion levers in ecommerce.
Business Impact: Significant missed conversion lift, especially on high-demand luxury items
                 where scarcity is both authentic and credible.
Recommendation: Add `stock: number` to Product schema (also needed for P3-013).
                Show "آخر {stock} قطع!" in amber when stock < 5, and "نفد المخزون" when stock === 0.
```

```
ID: P3-026
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Line: 190-208, 384-387
Severity: HIGH
Journey: Read reviews to build purchase confidence
Friction: Reviews are entirely fake (pseudo-random from hardcoded arrays). There is no
          review submission flow. "عرض جميع التقييمات" button (line 384) goes nowhere.
          The review count is derived as `Math.round(product.sales / 8)` — a formula.
Business Impact: Fake reviews are a legal liability and a catastrophic trust failure if
                 discovered by users or regulators. They also provide no genuine social proof.
Recommendation: Same as P3-015 — implement real review system. Until then, remove the
                "عرض جميع التقييمات" dead button. Do not display fabricated user names.
```

```
ID: P3-027
File: artifacts/vibe-app/src/pages/CheckoutPage.tsx — (entire checkout flow)
Severity: MEDIUM
Journey: User adds to cart but does not complete checkout
Friction: There is no abandoned checkout recovery mechanism. No email is captured before
          payment submission. No push notification or reminder is possible since the user
          may not be logged in (and there is no notification permission request).
Business Impact: Abandoned cart recovery is typically worth 5–15% additional revenue.
                 None of this is recoverable with the current architecture.
Recommendation: Capture email in step 1 of checkout (before address details). Enable
                browser push notifications opt-in on cart page to send abandoned cart reminders.
```

```
ID: P3-028
File: artifacts/vibe-app/src/pages/ProductDetailPage.tsx — Line: 322-332
Severity: MEDIUM
Journey: View social proof on product page
Friction: BuyersCount ("اشتراه X شخص هذا الأسبوع") uses `product.sales` directly — this
          is total lifetime sales, not weekly. The label is inaccurate.
          Additionally, the sales count has no time dimension in the DB.
Business Impact: Minor trust gap. If users notice the number never changes, credibility erodes.
Recommendation: Either fix the label to "اشتراه {sales}+ شخص" (lifetime) or add a
                `sales_this_week` field that is actually time-bounded.
```

```
ID: P3-029
File: artifacts/vibe-app/src/pages/CartPage.tsx — Line: 328-335
Severity: LOW
Journey: Complete cart review → proceed to checkout
Friction: The "إتمام الطلب" CTA in the cart has no trust microcopy nearby (no lock icon,
          no "دفع آمن" text). Trust signals only appear in the CheckoutPage CTA area.
          The cart-to-checkout transition is the second-largest dropout point.
Business Impact: Low — trust signals are visible one tap away, but adding them here costs nothing.
Recommendation: Add a single line of microcopy below the cart CTA:
                "🔒 دفع آمن | منتجات أصلية ١٠٠٪ | إرجاع مجاني ٣٠ يوماً"
```

---

## Summary

Total issues: **24**
CRITICAL: **4** | HIGH: **12** | MEDIUM: **7** | LOW: **1**

### Critical Path to Conversion
The most damaging combined flow is:
1. Guest user browses → adds to cart ✅
2. Taps "إتمام الطلب" → redirected to "/" (no return path) **P3-006/P3-022** ❌
3. Logs in → lands on homepage, cart merge never happens **P3-004** ❌
4. Navigates back to cart → items present (localStorage) → goes to checkout ✅
5. Submits order → if token expired in the interim, gets generic error with no recovery **P3-021** ❌

Three CRITICAL/HIGH issues in series make the end-to-end guest-to-purchase flow unreliable.
