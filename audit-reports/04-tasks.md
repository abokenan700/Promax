TASK PLAN — PHASE 4: ENHANCEMENTS
─────────────────────────────────────────
Generated: 2026-05-13
Ordered by impact/effort ratio — highest value, lowest risk first.
STRATEGIC items are in a separate section at the bottom.
─────────────────────────────────────────

ACTIONABLE TASKS (QUICK WIN & MEDIUM)
═══════════════════════════════════════════════════════════════════════════════

 1 | Set dir="rtl" globally on <html> in index.html; remove redundant per-component dir="rtl" attributes | artifacts/vibe-app/index.html, artifacts/vibe-app/src/App.tsx, artifacts/vibe-app/src/components/BottomNav.tsx | Eliminates a global RTL bug risk with a one-line fix; every future component inherits correct text direction automatically | Risk: L

 2 | Fix live notification badge count — fetch unread count from GET /api/v1/notifications, filter read !== "true", display actual count (cap 9+) instead of hardcoded "2" | artifacts/vibe-app/src/components/BottomNav.tsx | Hardcoded badge count destroys user trust once they notice it never changes; API + data already exist | Risk: L

 3 | Add live loyalty points API — add points column to usersTable, add GET /api/v1/users/me/points endpoint, award points on order creation, connect AccountPage LoyaltyCard to real data | lib/db/schema/users.ts, artifacts/api-server/src/routes/auth.ts, artifacts/vibe-app/src/pages/AccountPage.tsx | LoyaltyCard UI is complete with tier logic and progress bar — this is connecting existing wiring, no design work required | Risk: L

 4 | Add Recently Viewed Products — on ProductDetailPage mount push product ID to localStorage (max 10, dedup), add a "شاهدته مؤخراً" horizontal section to HomePage using existing FeaturedCard | artifacts/vibe-app/src/pages/ProductDetailPage.tsx, artifacts/vibe-app/src/App.tsx | Pure client-side, no backend required; adds a personalization surface immediately using existing card components | Risk: L

 5 | Fix PriceAlertsPage empty state — replace {/* Empty */} comment with TrendingDown icon (already imported), warm Arabic caption, and "تصفح المنتجات" CTA button in existing gold outline style | artifacts/vibe-app/src/pages/PriceAlertsPage.tsx | Blank empty state signals unfinished product; action-oriented empty state drives first alert creation | Risk: L

 6 | Fix WishlistPage empty state — add Heart icon, Arabic caption ("أضف منتجاتك المفضلة"), and "تصفح المنتجات" CTA; apply same pattern to CartPage empty state | artifacts/vibe-app/src/pages/WishlistPage.tsx, artifacts/vibe-app/src/pages/CartPage.tsx | Both pages currently show bare text with no recovery action; these are high-traffic abandonment surfaces | Risk: L

 7 | Fix FlashSale add-to-cart WCAG violation — wrap the 30×30px button in a 44×44 transparent touch target using padding; visual size unchanged | artifacts/vibe-app/src/components/Products.tsx | WCAG AA minimum is 44×44px; all other CartButton instances already comply; this is the only violation | Risk: L

 8 | Add ErrorBoundary onError hook — add optional onError prop, call it from componentDidCatch in addition to console.error, pass a handler stub from main.tsx ready to wire to any tracking service | artifacts/vibe-app/src/components/ErrorBoundary.tsx, artifacts/vibe-app/src/main.tsx | Production errors are currently invisible; this creates the integration point without coupling to any specific service | Risk: L

 9 | Tune React Query cache strategy per entity — products staleTime: 10min, cart staleTime: 0 (always fresh), notifications staleTime: 2min; remove global flat override where not needed | artifacts/vibe-app/src/main.tsx, artifacts/vibe-app/src/pages/CartPage.tsx | Flat 5min staleTime over-caches cart (stale data causes checkout errors) and under-caches stable product data | Risk: L

10 | Add upsell section on OrderSuccessPage — add "قد يعجبك أيضاً" horizontal scroll below the success animation using existing FeaturedCard and a products query filtered by the purchased category | artifacts/vibe-app/src/pages/OrderSuccessPage.tsx | Post-purchase is the highest-trust moment; upsell at this point captures impulse purchases with no funnel interruption | Risk: L

11 | Add coupon applied micro-interaction — on successful coupon validation trigger a 0.4s scale bounce (heartPop keyframe, already defined) on the discount row and a brief gold glow flash using --shadow-glow | artifacts/vibe-app/src/pages/CartPage.tsx | Positive reinforcement at the coupon moment increases checkout completion; all animation assets already exist in index.css | Risk: L

12 | Add order tracking number field — add tracking_number and carrier columns to ordersTable, render a "تتبع الشحنة" link on OrderCard when status is "shipped" | lib/db/schema/orders.ts, artifacts/api-server/src/routes/orders.ts, artifacts/vibe-app/src/pages/OrdersPage.tsx | Reduces support inquiries; completes the order tracking experience that currently shows status but no actionable tracking | Risk: L

13 | Add prefetch on card hover — on FeaturedCard and TrendingSection card onMouseEnter call queryClient.prefetchQuery for the product detail endpoint | artifacts/vibe-app/src/components/FeaturedCard.tsx, artifacts/vibe-app/src/components/TrendingSection.tsx | Reduces perceived navigation latency by 200–400ms; uses existing query keys and staleTime — no extra fetches on revisit | Risk: L

14 | Fix product image sizes attribute — add sizes="(max-width: 430px) 45vw, 200px" to all product card images; update Unsplash URLs in catalog.ts to serve w=300 for cards and w=600 for detail | artifacts/vibe-app/src/data/catalog.ts, artifacts/vibe-app/src/components/FeaturedCard.tsx | On a 430px mobile viewport, w=800 images waste 3× bandwidth; sizes hints enable correct responsive delivery | Risk: L

15 | Standardize TypeScript interface naming to [ComponentName]Props — update LoginSheet, StickyBuyBar, and ProductColorPicker from bare Props to descriptive names; document convention in replit.md | artifacts/vibe-app/src/components/LoginSheet.tsx, artifacts/vibe-app/src/components/StickyBuyBar.tsx, artifacts/vibe-app/src/components/ProductColorPicker.tsx | Eliminates search ambiguity and enforces a consistent convention for all future components | Risk: L

16 | Build CardSkeleton component — image zone + 3 stacked text-line placeholders at correct proportions (40% brand / 80% name / 35% price); replace single-rect skeletons in TrendingSection, NewArrivals, Products | artifacts/vibe-app/src/components/TrendingSection.tsx, artifacts/vibe-app/src/components/NewArrivals.tsx, artifacts/vibe-app/src/components/Products.tsx | Skeletons that match content shape eliminate layout shift on load and communicate product structure before data arrives | Risk: L

17 | Migrate coupon storage to DB — create coupons table with type (percent/fixed), code, discount_value, min_order, max_uses, expiry_at; update validate endpoint to DB lookup; remove hardcoded COUPONS object | artifacts/api-server/src/routes/coupons.ts, lib/db/schema | Hardcoded coupons require a code deploy to update; DB-backed coupons enable marketing team self-service | Risk: M

18 | Build Address Book — add addressesTable to schema, create /addresses GET, POST, DELETE endpoints, build AddressesPage, wire CheckoutPage to pre-fill from saved address | lib/db/schema, artifacts/api-server/src/routes, artifacts/vibe-app/src/pages | Required for checkout address pre-fill; eliminates re-entry friction on repeat orders; AccountPage menu item already exists | Risk: M

19 | Implement variant image switching — extend product data model with colorImages field (Record<string, string>), update ProductDetailPage ImageGallery to swap image src on color selection via ProductColorPicker | artifacts/vibe-app/src/pages/ProductDetailPage.tsx, artifacts/vibe-app/src/components/ProductColorPicker.tsx, lib/db/schema | Color picker exists and color selection state is managed — the image gallery just needs to respond to it | Risk: M

20 | Add SearchPage infinite scroll — add limit/offset to GET /api/v1/products, implement useInfiniteQuery in SearchPage, add intersection observer for "تحميل المزيد" trigger | artifacts/api-server/src/routes/products.ts, artifacts/vibe-app/src/pages/SearchPage.tsx | Unbounded search response is a performance time-bomb as catalog grows; critical before catalog exceeds ~200 products | Risk: M

21 | Add Framer Motion to LoginSheet and product bottom sheet — replace CSS slideUp with AnimatePresence + motion.div y-spring; add whileTap={{ scale: 0.92 }} to CartButton; preserve all existing CSS keyframes | artifacts/vibe-app/src/components/LoginSheet.tsx, artifacts/vibe-app/src/components/CartButton.tsx | Framer Motion is installed and paid for — spring physics on the two highest-traffic interaction moments delivers premium feel | Risk: M

22 | Adopt CVA in CartButton — refactor the most variant-complex component (md circle, sm circle, success circle, ghost) to a CVA variant map with TypeScript enforcement; use as the model for future migrations | artifacts/vibe-app/src/components/CartButton.tsx | CVA is installed but used in only 2 of 21 components; CartButton is the highest-priority because it has the most variants and the WCAG-critical sizing | Risk: M

23 | Add virtual list to SearchPage results grid — integrate @tanstack/react-virtual for the main product grid; home section horizontal carousels are short enough to skip | artifacts/vibe-app/src/pages/SearchPage.tsx | At >200 products, rendering all cards simultaneously causes visible scroll jank on mid-range Android devices | Risk: M

24 | Document new feature checklist in replit.md — (1) DB schema, (2) API route, (3) api-spec registration, (4) generated client hook, (5) page + App.tsx route; add JSDoc blocks to top 5 most-used components | replit.md, artifacts/vibe-app/src/components/CartButton.tsx, artifacts/vibe-app/src/components/LoginSheet.tsx | The architecture already follows this pattern correctly — writing it down prevents the three-spacing-system problem from recurring | Risk: L

─────────────────────────────────────────
Total actionable tasks: 24
─────────────────────────────────────────


FUTURE PREPARATION (STRATEGIC ITEMS)
═══════════════════════════════════════════════════════════════════════════════
These items require architectural preparation now to avoid costly refactors later.
Do not execute until explicitly approved.

SP-01 | Design user_events table schema (product_view, category_visit, purchase) as the foundation for all personalization and recommendation features. No UI required yet — schema only. | lib/db/schema | Without this table, any future "recommended for you" feature requires a full backfill migration | Risk: L

SP-02 | Design subscriptions table schema with user_id, product_id, frequency (weekly/monthly), next_billing_date, status. Document billing cycle contract in a markdown spec. No implementation yet. | lib/db/schema, docs/ | Subscriptions require careful state machine design; schema decisions made at MVP stage are hard to reverse | Risk: L

SP-03 | Evaluate product bundles data model — document whether bundles are separate product records, a product_bundles join table, or a virtual computed type. Decision shapes catalog architecture. | lib/db/schema | Bundle support is expected in regional e-commerce; delaying the data model decision locks out the feature | Risk: L

SP-04 | Add multi-currency display layer — create a currency config (supported currencies, SAR as base), add a currency selector to Header, store preference in localStorage. All prices display as converted; backend always stores in SAR. | artifacts/vibe-app/src/components/Header.tsx, artifacts/vibe-app/src/lib | Multi-currency is a table-stakes feature for cross-GCC reach; implementing early avoids retrofitting all price display components | Risk: M

SP-05 | Evaluate digital product delivery architecture — if digital products (gift cards, e-vouchers) are in scope, document the delivery mechanism (email, in-app download) and whether a fulfillment column is needed on order_items. | lib/db/schema | Digital fulfillment has different post-purchase logic than physical; deciding architecture before orders table is extended is critical | Risk: L

─────────────────────────────────────────
Total strategic preparation tasks: 5
─────────────────────────────────────────
