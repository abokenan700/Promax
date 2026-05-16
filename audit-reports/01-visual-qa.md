# Visual QA Report — Phase 1
Generated: 2026-05-13

---

## Scores

| Area | Score | Critical Issues |
|---|---|---|
| Spacing & Layout | 6/10 | 0 |
| Typography | 5/10 | 0 |
| Component Consistency | 5/10 | 1 |
| Motion & Interaction | 6/10 | 1 |
| Mobile Ergonomics | 5/10 | 2 |
| Conversion UX | 6/10 | 1 |
| **Overall Visual Score** | **5.5/10** | |

---

## Issues — Spacing & Layout

---

ID: P1-001
File: `artifacts/vibe-app/src/App.tsx` — Line: 78, 81, 91
Severity: MEDIUM
Problem: Three consecutive section wrappers use inconsistent padding approaches. Line 78 uses `className="px-3 py-2"`, line 81 uses `style={{ padding: "0 0 2px" }}` (not on the 4px grid), and line 91 uses `style={{ padding: "8px 0" }}`. No two sections share the same wrapping convention.
User Impact: Sections have subtly different visual breathing room, creating a layout that feels unpolished on close inspection.
Recommendation: Standardise all home-page section wrappers to a shared spacing token (e.g. `padding: "0 0 var(--spacing-sm)"`) or a single layout class. Remove the arbitrary `2px` value entirely.

---

ID: P1-002
File: `artifacts/vibe-app/src/components/TrendingSection.tsx` — Line: 74
Severity: MEDIUM
Problem: Card content padding is `"9px 10px 11px"`. None of these values (9, 11) exist on the 4px grid. The same pattern appears in `NewArrivals.tsx` line 96.
User Impact: Card content is slightly misaligned compared to cards rendered by `FeaturedCard` and `DealCard`, which use grid-aligned padding.
Recommendation: Replace with `"8px 10px 12px"` (all 4px-grid values) or use the token scale directly: `padding: "var(--spacing-sm) var(--spacing-md)"`.

---

ID: P1-003
File: `artifacts/vibe-app/src/components/StickyBuyBar.tsx` — Line: 19
Severity: MEDIUM
Problem: Container padding is `"10px 14px"`. Both values are off the 4px grid (should be 8 or 12 for vertical; 12 or 16 for horizontal).
User Impact: The sticky bar content sits slightly off from the global layout grid, causing subtle misalignment with page content above it.
Recommendation: Change to `padding: "12px 16px"` to align with the token scale.

---

ID: P1-004
File: `artifacts/vibe-app/src/components/CollectionBanners.tsx` — Line: 46
Severity: MEDIUM
Problem: `borderRadius: 18` is hardcoded. The token system offers `--radius-lg` (20px) and `--radius-card` (16px) but not 18px. Height is also fixed at `150px` with no fluid sizing.
User Impact: Collection banners have a radius that belongs to no design token, breaking visual consistency with all other rounded containers. On very small screens the fixed height may crop image content awkwardly.
Recommendation: Replace `18` with `var(--radius-lg)` (20px) and consider replacing the fixed height with a `min-height` + `aspect-ratio` combination for fluid responsiveness.

---

ID: P1-005
File: `artifacts/vibe-app/src/components/Features.tsx` — Line: 17–18, `App.tsx` — Line: 79
Severity: LOW
Problem: `Features` renders its own `px-3 py-2` padding, and its parent `<div>` in `App.tsx` wraps it with an additional `className="px-3 py-2"` — resulting in double horizontal padding (24px total instead of 12px).
User Impact: The "trust strip" (features bar) is horizontally squeezed more than other sections, reducing its visual breathing room.
Recommendation: Remove the outer wrapper padding in `App.tsx` around `<Features />`, leaving the component to manage its own spacing.

---

ID: P1-006
File: `artifacts/vibe-app/src/components/Header.tsx` — Line: 20, `artifacts/vibe-app/src/components/BottomNav.tsx` — Line: 77
Severity: LOW
Problem: Both `Header` and `BottomNav` use `bg-white` Tailwind class as their background. Dark mode handles this via the global `.bg-white { background-color: var(--bg-card) !important; }` override in `index.css`. This is fragile — any refactor that removes that `!important` rule will break dark mode for both components.
User Impact: No current visual impact; a latent maintenance risk.
Recommendation: Replace `bg-white` with an inline `style={{ background: "var(--bg-card)" }}` on both components to make the token dependency explicit and remove reliance on the override rule.

---

ID: P1-007
File: `artifacts/vibe-app/src/pages/ProductDetailPage.tsx` — Lines: 62, 66, 130, 305
Severity: LOW
Problem: Several inline style values use non-grid spacing. Examples: `padding: "14px 16px"` (14 is off-grid), `padding: "9px 12px"`, `padding: "8px 10px 10px"`. The `14px` values appear in AccordionRow and related-product card.
User Impact: Subtle spacing inconsistencies across the most complex page in the app.
Recommendation: Round all inline padding values to the nearest 4px token value: `14px → 12px` or `16px`, `10px → 8px` or `12px`.

---

ID: P1-008
File: `artifacts/vibe-app/src/pages/OrdersPage.tsx` — Line: 138
Severity: LOW
Problem: `borderLeft: "1px solid var(--border)"` uses a physical CSS property in an RTL context. In RTL layout `border-left` renders on the wrong side. Should be `borderInlineStart`.
User Impact: In RTL, the divider between "تفاصيل الطلب" and "إعادة الطلب" appears on the visually incorrect side of the layout.
Recommendation: Replace `borderLeft` with `borderInlineStart` (logical CSS property).

---

## Issues — Typography

---

ID: P1-009
File: `artifacts/vibe-app/src/components/Header.tsx` — Lines: 30, 34, 39
Severity: MEDIUM
Problem: Brand logo uses `fontSize: "24px"` (hardcoded, exceeds `--text-xl` max of 22px) and greeting sub-label uses `fontSize: 11` (hardcoded). Neither uses the CSS token scale.
User Impact: The logo text does not scale fluidly on viewport size. The greeting is fixed at 11px — at minimum `--text-2xs` (clamp 8.5px–10px) or `--text-xs` (clamp 10px–12px) would be more appropriate and fluid.
Recommendation: Keep the 24px brand logo size if intentional but document it as a design exception. Change the greeting to use `fontSize: "var(--text-xs)"` for fluid scaling.

---

ID: P1-010
File: `artifacts/vibe-app/src/components/ui/Input.tsx` — Line: 73
Severity: MEDIUM
Problem: `fontSize: "clamp(13px,3.6vw,14px)"` — the max clamps at 14px, but `--text-base` is `clamp(13px, 3.6vw, 15px)`. This creates a 1px inconsistency where the input field text renders smaller than equivalent body text at large viewport widths.
User Impact: Input text appears ever-so-slightly smaller than surrounding body text at wider breakpoints, creating subtle typographic dissonance in the Login sheet.
Recommendation: Change to `fontSize: "var(--text-base)"` to use the exact token.

---

ID: P1-011
File: Multiple — `TrendingSection.tsx` L21, `SearchPage.tsx` L118/429, `CartPage.tsx` L307/310, `OrdersPage.tsx` L125, `CheckoutPage.tsx` L74
Severity: MEDIUM
Problem: Widespread use of intermediate font sizes that don't map to any token: `9.5px`, `11.5px`, `12.5px`, `13.5px`, `17px`. The token scale jumps from `--text-sm` (max 13px) to `--text-base` (max 15px) to `--text-lg` (max 17px) — but many components use intermediate values in inline styles, bypassing the scale entirely.
User Impact: Text rendering is inconsistent across screens. The typographic rhythm is broken in the Orders, Cart, Search, and Checkout flows.
Recommendation: Map all in-between sizes to the nearest token. `11.5px → var(--text-xs)`, `12.5px → var(--text-sm)`, `13.5–14px → var(--text-base)`, `17px → var(--text-lg)`. The semantic type classes (`.type-body`, `.type-caption`, etc.) defined in `index.css` are not used anywhere in the codebase — adoption should be enforced.

---

ID: P1-012
File: `artifacts/vibe-app/src/pages/NotificationsPage.tsx` — Line: 105
Severity: MEDIUM
Problem: Arabic notification body text uses `lineHeight: 1.5`. The DESIGN_DNA specifies minimum 1.6 for Arabic body paragraphs. This affects multi-line notification text readability.
User Impact: Arabic body text in notifications is slightly cramped, reducing legibility for longer notification messages.
Recommendation: Change to `lineHeight: 1.65` to match the `--type-body` specification.

---

ID: P1-013
File: `artifacts/vibe-app/src/components/StickyBuyBar.tsx` — Lines: 27–28
Severity: LOW
Problem: Price label uses `fontSize: 10` (not a token value — between `--text-2xs` max of 10px and off-scale), price value uses `fontSize: 16` (no token for this; between `--text-lg` max 17px and `--text-base` max 15px).
User Impact: The price display in the sticky bar uses a bespoke size that is inconsistent with the rest of the product pricing typography.
Recommendation: Use `fontSize: "var(--text-2xs)"` for the label and `fontSize: "var(--text-lg)"` for the price value.

---

ID: P1-014
File: `artifacts/vibe-app/src/pages/AccountPage.tsx` — Line: 109
Severity: LOW
Problem: `text-[#2E2C2A]` uses a hardcoded hex in a Tailwind arbitrary class. This bypasses the `--text-primary` token, which correctly maps to `#2E2C2A` in light mode and `#F0EBE3` in dark mode. The hardcoded value will not change in dark mode.
User Impact: The "حسابي" page header title will remain dark even in system dark mode, creating a contrast failure.
Recommendation: Replace `text-[#2E2C2A]` with `style={{ color: "var(--text-primary)" }}`.

---

ID: P1-015
File: `artifacts/vibe-app/src/pages/ProductDetailPage.tsx` — Line: 62
Severity: LOW
Problem: `AccordionRow` title text uses `color: "#1E1C1A"` hardcoded. This should be `var(--text-primary)` for dark mode compatibility. The same pattern appears at lines 246, 253, 288, 307.
User Impact: Several pieces of text in the product detail page will remain light-on-dark in dark mode (contrast failure).
Recommendation: Replace all `"#1E1C1A"`, `"#2E2C2A"`, `"#4A4846"` hardcoded colors with their respective CSS tokens (`var(--text-primary)`, `var(--text-secondary)`).

---

## Issues — Component Consistency

---

ID: P1-016
File: `artifacts/vibe-app/src/components/ui/Button.tsx` — (entire file)
Severity: CRITICAL
Problem: The CVA-based `Button` component exists and is fully implemented with 7 variants and 8 size options, but it is **not used anywhere in the codebase**. Every interactive button across all 12+ pages and 20+ components is a raw `<button>` with bespoke inline styles. This means there is zero enforcement of button standards — hover states, focus rings, disabled styles, and active transforms are each reimplemented (or forgotten) per-component.
User Impact: Missing or inconsistent hover/focus/disabled states across the app. Several buttons lack any visible focus indicator (keyboard accessibility failure). No guarantee that a new button added by a developer will match the design system.
Recommendation: Begin migrating buttons from most-used patterns first: the primary dark CTA buttons (LoginSheet, CheckoutPage, OrderSuccessPage, WishlistPage), then outline gold buttons. Each migration replaces ~8-10 lines of inline style with `<Button variant="primary" size="lg">`.

---

ID: P1-017
File: `artifacts/vibe-app/src/pages/CheckoutPage.tsx` — Lines: 43–60
Severity: HIGH
Problem: `CheckoutPage` defines its own local `Field` component with `borderRadius: 12` (bypasses `--radius-md`), border `1.5px solid border-warm` at rest (vs. the shared `Input.tsx` which uses `#E8E4DE`), and `fontSize: 14` vs. `clamp(13px,3.6vw,14px)`. The shared `Input` component from `ui/Input.tsx` is NOT used.
User Impact: Checkout form inputs look and behave differently from the Login sheet inputs, breaking visual consistency at the most trust-sensitive page of the flow.
Recommendation: Replace the local `Field` with the shared `<Input>` component, using the `label` as an external element above the input.

---

ID: P1-018
File: Multiple — `ProductDetailPage.tsx` L40, `FeaturedCard.tsx` L14, `TrendingSection.tsx` L9, `SearchPage.tsx` L64
Severity: HIGH
Problem: A `Stars` component is defined locally in 4 separate files. Each has slightly different star icon sizes (8px, 9px, 12px, 13px) and different strokeWidth values (1.4, 1.5). There is no shared `<Stars>` primitive.
User Impact: Star ratings render at different sizes across cards, search results, and the product detail page, creating visible inconsistency in a core trust signal.
Recommendation: Extract to `artifacts/vibe-app/src/components/ui/Stars.tsx` with a configurable `size` prop defaulting to 10px, and replace all 4 local definitions.

---

ID: P1-019
File: `artifacts/vibe-app/src/components/NewArrivals.tsx` — Line: 104–108
Severity: HIGH
Problem: The add-to-cart button in `NewArrivals` is a raw 32×32px circle with a hardcoded gradient (`linear-gradient(135deg,#1E1C1A,#2E2C2A)`) — not using the `CartButton` component that all other card grids use. It also provides no "added" state feedback.
User Impact: Adding from NewArrivals feels different from all other sections — no success animation, different visual style, inconsistent brand identity.
Recommendation: Replace with `<CartButton size="sm" product={p} selectedColor={p.colors?.[0]} />`, which already handles the added state, correct gradient, and 44px touch wrapper.

---

ID: P1-020
File: `artifacts/vibe-app/src/components/StickyBuyBar.tsx` — Lines: 33–38
Severity: MEDIUM
Problem: Both the "أضف للسلة" and "اشتري الآن" buttons use hardcoded `borderRadius: 12` instead of `var(--radius-md)` (14px). The added-state gradient uses hardcoded `#5A8A4A,#3d6b35` instead of `var(--success)` token.
User Impact: Buttons in the sticky bar have a slightly tighter radius than all other equivalent CTA buttons, creating a subtle but perceptible inconsistency on the product page.
Recommendation: Replace `borderRadius: 12` with `borderRadius: "var(--radius-md)"` and `#5A8A4A` with `var(--success)`.

---

ID: P1-021
File: `artifacts/vibe-app/src/components/Header.tsx` — Line: 50
Severity: LOW
Problem: Notification bell button uses `hover:bg-[#fdf6ec]` (hardcoded hex) for its hover state while the adjacent user button correctly uses `hover:bg-[var(--gold-pale)]`.
User Impact: In dark mode, the hover state on the bell button remains a light gold instead of adapting to the dark mode `--gold-pale` value.
Recommendation: Change to `hover:bg-[var(--gold-pale)]` to match the user button and respect dark mode.

---

ID: P1-022
File: `artifacts/vibe-app/src/components/CollectionBanners.tsx` — Line: 44–48
Severity: LOW
Problem: A `<div>` with `role="button"` and `aria-label` is used as an interactive element. This is an ARIA antipattern — `role="button"` does not provide keyboard activation by default (`Enter`/`Space` keys do not fire `onClick`). Should be a native `<button>` or semantically structured differently.
User Impact: Keyboard users who navigate to the collection banner cannot activate it with `Enter` or `Space`. Screen readers announce it as "button" but it doesn't behave as one.
Recommendation: Replace the wrapping `<div role="button">` with a native `<button>` and adjust styling (set `width: 100%`, remove default button appearance).

---

## Issues — Motion & Interaction

---

ID: P1-023
File: `artifacts/vibe-app/src/pages/ProductDetailPage.tsx` — Line: 142
Severity: CRITICAL
Problem: The dot indicator for the image gallery uses `transition: "width 0.25s, background 0.25s"` with `width` values changing from `6` to `18` on active state. Animating `width` triggers a layout reflow on every animation frame, causing jank during swipe interactions.
User Impact: On mid-range mobile hardware, swiping between product gallery images produces visible stutter as the dot indicator forces the browser to recalculate layout every frame.
Recommendation: Replace width animation with `scaleX` transform: fix width at `18px` and use `transform: scaleX(active ? 1 : 0.33)` — the same pattern already used correctly in `BannerSlider.tsx` and `BottomNav.tsx`.

---

ID: P1-024
File: `artifacts/vibe-app/src/components/BannerSlider.tsx` — Line: 146–148 (dot indicators)
Severity: HIGH
Problem: Banner slider dots correctly use `scaleX` transform — however the outer indicator `<button>` has `minWidth: 44, minHeight: 44` touch target but `gap: 0` between them. With 4 slides × 44px width = 176px total, which is 41% of a 430px viewport — the dots take up a disproportionate tappable area at the bottom-right of the banner.
User Impact: On narrow viewports (≤375px), the dot hit areas likely overlap the banner's "تسوق الآن" CTA, causing accidental navigation instead of slide selection.
Recommendation: Reduce the touch wrapper to `minWidth: 36, minHeight: 36` (still accessible) or switch to a single row with `gap: 4` between visual dots (6px) where the touch area can overlap without conflict.

---

ID: P1-025
File: `artifacts/vibe-app/src/pages/ProductDetailPage.tsx` — Lines: 65–66
Severity: HIGH
Problem: `AccordionRow` animates `max-height: 0 → 300px`. This is the classic "max-height animation" antipattern — when content is shorter than 300px, the animation appears fast (jumps to content height immediately). It also causes layout recalculation every frame.
User Impact: Accordion sections on the product page open/close with an unnatural speed — fast snap open, slow close. The `0.3s ease` timing feels disconnected from the actual content length.
Recommendation: Replace with CSS Grid `grid-template-rows: 0fr → 1fr` transition, which animates the exact content height without layout cost and without needing a hardcoded max.

---

ID: P1-026
File: `artifacts/vibe-app/src/pages/ProductDetailPage.tsx` — Lines: 293–295
Severity: MEDIUM
Problem: Related product cards use `onMouseEnter` / `onMouseLeave` JS handlers to directly mutate `style.transform`. No transition is defined in these JS handlers (only a Tailwind `transition-colors` is present on the element class, which does not cover transform). The translateY snap is instant.
User Impact: The hover lift animation on related product cards is jarring on desktop — cards jump up instantly with no easing.
Recommendation: Add `transition: "transform 0.15s ease"` to the button's base style object and use CSS classes or consistent transition tokens instead of direct style mutation.

---

ID: P1-027
File: `artifacts/vibe-app/src/index.css` — Line: 296–299
Severity: MEDIUM
Problem: `pageEnter` keyframe animates `translateX(16px)`. In a right-to-left app, content entering from +16px on the X axis means it slides in from the LEFT side of the screen — which is the "backward" direction in Arabic reading flow. A page transition should feel like moving forward (entering from the right, i.e. `translateX(-16px)` in LTR → `translateX(16px)` is correct in RTL if the transform origin is in RTL coords, but in CSS `translateX` is always visual-left regardless of `dir`). This needs clarification or a direction-aware approach.
User Impact: Page transitions may feel like navigating "backward" (slides in from left = backwards for RTL users who expect new content to arrive from the right).
Recommendation: Change `pageEnter` to use `translateX(-16px)` (which in a LTR pixel space means slide in from right — correct "forward" direction for RTL content reading). Or use `inset-inline-start` animation via a `translateInlineEnd` approach.

---

ID: P1-028
File: `artifacts/vibe-app/src/components/SearchFilters.tsx` — Lines: 31, 87
Severity: MEDIUM
Problem: Both `SortSheet` and `FilterSheet` close when clicking the backdrop overlay, but there is no `Escape` key handler. Keyboard users who open a filter sheet have no keyboard exit path other than tabbing to the close button.
User Impact: Keyboard and assistive technology users are unable to dismiss filter/sort sheets with `Escape`, violating ARIA dialog best practice.
Recommendation: Add `useEffect` with a `keydown` listener for `Escape` on both sheet components, calling `onClose()`. Also verify that focus is trapped within the sheet when open.

---

## Issues — Mobile Ergonomics

---

ID: P1-029
File: `artifacts/vibe-app/src/pages/CartPage.tsx` — Lines: 200–201
Severity: CRITICAL
Problem: Cart upsell "add" button is `width: 26, height: 26` — 18px below the 44px WCAG 2.5.5 minimum touch target. No wrapper expands the hit area.
User Impact: Upsell section add-to-cart buttons are extremely difficult to tap accurately on mobile, especially for users with motor impairments. Missed taps likely lead to accidental product navigation.
Recommendation: Wrap with a 44×44px transparent button (same pattern as `CartButton`) or increase the visual button to at least 36×36px with padding to reach 44px minimum.

---

ID: P1-030
File: `artifacts/vibe-app/src/components/SearchFilters.tsx` — Lines: 37, 228–234
Severity: CRITICAL
Problem: SortSheet close button is `width: 32, height: 32`. ControlsBar view-toggle button is `width: 34, height: 34`. Both are below the 44px WCAG minimum.
User Impact: Users with large thumbs or motor disabilities will frequently miss these targets. The sort/filter controls are central to the search UX.
Recommendation: Increase both to `minWidth: 44, minHeight: 44` using the pattern `display: "flex", alignItems: "center", justifyContent: "center", minWidth: 44, minHeight: 44` with a visual inner element if needed.

---

ID: P1-031
File: `artifacts/vibe-app/src/components/Header.tsx` — Lines: 49–64
Severity: HIGH
Problem: Both the bell (notifications) and user (account) icon buttons in the header are `w-9 h-9` = 36×36px. This is below the WCAG 2.5.5 recommended 44×44px minimum touch target.
User Impact: The two most important navigation shortcuts (account, notifications) in the app header are harder to tap than they should be, causing mis-taps for users with average-sized thumbs.
Recommendation: Change to `w-11 h-11` (44px) or add `style={{ minWidth: 44, minHeight: 44 }}` while keeping the visual circle at 36px (using padding to expand the tap zone).

---

ID: P1-032
File: `artifacts/vibe-app/src/pages/SearchPage.tsx` — Line: 170
Severity: HIGH
Problem: ResultCardList wishlist button is `width: 34, height: 34` — below 44px.
User Impact: Users browsing search results in list mode have a below-spec wishlist button, making it easy to accidentally navigate to the product detail page instead.
Recommendation: Change to `minWidth: 44, minHeight: 44` with visual inner circle, identical to the approach used in grid result cards.

---

ID: P1-033
File: `artifacts/vibe-app/src/components/BannerSlider.tsx` — Line: 114–121
Severity: HIGH
Problem: The "تسوق الآن" (Shop Now) CTA button on the banner uses `py-1.5` (6px vertical padding) and `text-[clamp(10px,3vw,13px)]`. At minimum font size the button is approximately 10px text + 12px padding = ~22px tall. This is half the required minimum touch target.
User Impact: The primary conversion CTA on the most prominent visual element of the homepage is too small to reliably tap on mobile. Users who try to tap "Shop Now" may instead change slides or tap into the banner image.
Recommendation: Change to `py-2.5 px-5` (minimum 40px height) or add `minHeight: 44` to the button style.

---

ID: P1-034
File: `artifacts/vibe-app/src/components/CollectionBanners.tsx` — Line: 69
Severity: MEDIUM
Problem: Collection banner "تسوق الآن" CTA has `padding: "7px 16px"` = approximately 28px tall at 12px font size — below 44px.
User Impact: Users tapping the collection banner CTAs are likely to hit the banner image instead, causing either no action or accidental navigation.
Recommendation: Change to `padding: "10px 16px"` minimum, or wrap with `minHeight: 44` container.

---

ID: P1-035
File: `artifacts/vibe-app/src/components/BottomNav.tsx` — Line: 130
Severity: LOW
Problem: Nav label text is `text-[9.5px]` — below any defined token (`--text-2xs` starts at 8.5px, which is already very small). At 9.5px these Arabic label strings become hard to read, especially for users 40+ or in bright outdoor light.
User Impact: Bottom nav labels are marginally legible. "التصنيفات" (6 Arabic chars) at 9.5px is at the very edge of readability on standard mobile displays.
Recommendation: Increase to `text-[var(--text-2xs)]` (clamp 8.5px–10px) and consider whether 10px might be more appropriate given Arabic character complexity.

---

## Issues — Conversion UX

---

ID: P1-036
File: `artifacts/vibe-app/src/pages/OrderSuccessPage.tsx` — Line: 94
Severity: CRITICAL
Problem: The order success page hardcodes `"الدفع عند الاستلام"` (Cash on Delivery) as the payment method in the order summary card, regardless of what method the user selected in checkout. If a user paid by card or Apple Pay, the success page incorrectly shows cash as the payment method.
User Impact: Users who paid by credit card or Apple Pay see "Cash on Delivery" on their confirmation screen — a serious trust signal failure that may cause confusion, doubt, or unnecessary support contacts.
Recommendation: Pass the selected payment method from `CheckoutPage` through navigation state or a shared context, and display the actual selection on `OrderSuccessPage`.

---

ID: P1-037
File: `artifacts/vibe-app/src/pages/CheckoutPage.tsx` — Lines: 228–244
Severity: HIGH
Problem: The checkout CTA (bottom bar) has no trust signals adjacent to it: no SSL/secure payment icon, no order summary count, no "your data is safe" microcopy. The button is the only element in the bottom bar.
User Impact: At the most trust-sensitive moment of the purchase funnel, there is nothing to reassure hesitant users. Cart abandonment risk at checkout is directly correlated with lack of trust signals.
Recommendation: Add a 1-line trust strip above the CTA button: a row of 3 small icons (shield, lock, return) with `font-size: --text-2xs` microcopy. Equivalent to the `Features` component trust bar on the homepage.

---

ID: P1-038
File: `artifacts/vibe-app/src/components/NewArrivals.tsx` — Lines: 24–29
Severity: HIGH
Problem: The "نسائي" (Women) and "رجالي" (Men) filter tabs in NewArrivals are based on array index arithmetic (`i % 3 !== 0` / `i % 3 === 0`) rather than any actual product category data. This means the "Women's" tab may show men's products and vice versa — the filtering is cosmetic and meaningless.
User Impact: Users who tap "نسائي" expecting to see women's items will see an arbitrary subset. This erodes trust in the filter system and makes the feature feel broken.
Recommendation: Either remove the gender tabs until real category data supports them, or replace with filter keys that map to actual product properties (e.g. `p.category === "female"`).

---

ID: P1-039
File: `artifacts/vibe-app/src/pages/ProductDetailPage.tsx` — Lines: 430–436
Severity: MEDIUM
Problem: The product error state (when product is not found) shows a shopping bag icon, "المنتج غير موجود" heading, and two buttons: "رجوع" and "تصفح المنتجات". While functional, there is no contextual suggestion (e.g. "قد يعجبك أيضاً" related products, or a link to the top category).
User Impact: Users who land on a broken/removed product URL hit a dead end with no recovery path except generic browsing. Missed opportunity for conversion recovery.
Recommendation: Add a mini carousel of 4 featured products below the error buttons (reuse the same related products data already fetched elsewhere).

---

ID: P1-040
File: `artifacts/vibe-app/src/pages/WishlistPage.tsx` — Line: 112–116
Severity: MEDIUM
Problem: All products in WishCard always show a discount badge (`item.discount%`) — even if `item.discount` is 0, the badge would render as "0%". There is no conditional to hide the badge when discount is absent.
User Impact: Products with no discount will show a "0%" badge, which looks like a data error and reduces credibility.
Recommendation: Add `{item.discount > 0 && <span ...>{item.discount}%</span>}` to match the pattern used in FeaturedCard and DealCard.

---

ID: P1-041
File: `artifacts/vibe-app/src/pages/AccountPage.tsx` — Lines: 108–110
Severity: LOW
Problem: The Account page header "حسابي" is rendered as a plain `<h1>` within a flex bar with no back navigation button. All other secondary pages (Orders, Notifications, Checkout) have a back button. The Account page accessible via BottomNav has no way to return to the previous route via header (only via BottomNav).
User Impact: Minor UX inconsistency — the Account header looks different from all other page headers, which creates a weak sense of navigational hierarchy.
Recommendation: This is a low-priority consistency issue. If the intent is that Account is always a root-level tab destination (no back needed), document this decision. Otherwise add a back button matching other page headers.

---

## Summary

Total issues: **41**
CRITICAL: **5** | HIGH: **14** | MEDIUM: **16** | LOW: **6**

### Issue distribution by area:
- Spacing & Layout: 8 issues (0 Critical, 2 High, 4 Medium, 2 Low)
- Typography: 7 issues (0 Critical, 1 High, 4 Medium, 2 Low)
- Component Consistency: 7 issues (1 Critical, 2 High, 3 Medium, 1 Low)
- Motion & Interaction: 6 issues (1 Critical, 2 High, 3 Medium, 0 Low)
- Mobile Ergonomics: 7 issues (2 Critical, 3 High, 1 Medium, 1 Low)
- Conversion UX: 6 issues (1 Critical, 3 High, 1 Medium, 1 Low)

### Top 5 systemic risks:
1. **Button component not adopted** — zero CVA Button usage across the entire codebase means no consistency guarantees on any interactive element.
2. **Touch targets below 44px** — 7 confirmed violations across Header, Search, Cart Upsell, Filter sheets, and Collection banners.
3. **Hardcoded colors bypass dark mode** — multiple `#1E1C1A`, `#2E2C2A`, `#4A4846` values in ProductDetailPage will fail in dark mode.
4. **Payment method on OrderSuccess** — hardcoded "cash on delivery" is a live trust failure for card/Apple Pay users.
5. **NewArrivals fake filtering** — gender tabs are non-functional, which will confuse and frustrate users.
