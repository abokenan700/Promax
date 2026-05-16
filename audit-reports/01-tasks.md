# Task Plan — Phase 1 Visual QA Fixes
Source: `audit-reports/01-visual-qa.md`
Generated: 2026-05-13

Priority order: Critical blockers → Trust/conversion regressions → WCAG violations → Systemic consistency → Visual polish.

---

## T01 — Fix hardcoded payment method on Order Success page
Audit ref: P1-036
Severity: CRITICAL
Effort: XS (< 30 min)

### Problem
`OrderSuccessPage.tsx` line 94 hardcodes `"الدفع عند الاستلام"` (Cash on Delivery) regardless of the user's actual selection in checkout.

### Acceptance criteria
- The payment method displayed on the order success screen matches whatever the user selected in `CheckoutPage` (Cash on Delivery, Credit Card, or Apple Pay).
- No regression on the rest of the success page layout.

### Implementation notes
- `CheckoutPage` already tracks `paymentMethod` in local state. Pass it via wouter navigation state: `navigate("/order-success", { state: { paymentMethod } })`.
- In `OrderSuccessPage`, read with `const { paymentMethod } = useLocation()[0]?.state ?? {}` (or equivalent wouter API).
- Map to Arabic display: `card → "بطاقة ائتمانية"`, `apple → "Apple Pay"`, `cod → "الدفع عند الاستلام"`.
- Fallback to `"الدفع عند الاستلام"` if state is absent (direct URL access).

### Files
- `artifacts/vibe-app/src/pages/CheckoutPage.tsx`
- `artifacts/vibe-app/src/pages/OrderSuccessPage.tsx`

---

## T02 — Fix cart upsell add-to-cart touch target (26×26px → 44px)
Audit ref: P1-029
Severity: CRITICAL
Effort: XS (< 30 min)

### Problem
`CartPage.tsx` line ~201: upsell add button is 26×26px — 18px below WCAG 2.5.5 minimum.

### Acceptance criteria
- Upsell add buttons have a minimum 44×44px tap area.
- Visual size of the button icon/circle can remain compact; touch expansion is the requirement.
- No layout shift in the upsell card row.

### Implementation notes
- Wrap the existing button with a 44×44px transparent container (same pattern as `CartButton.tsx`).
- OR replace the upsell button with `<CartButton size="sm" product={...} />` if the upsell item maps to a valid product object.
- Verify on a 375px viewport that the upsell card row does not overflow.

### Files
- `artifacts/vibe-app/src/pages/CartPage.tsx`

---

## T03 — Fix SortSheet close button and ControlsBar view-toggle touch targets
Audit ref: P1-030
Severity: CRITICAL
Effort: XS (< 30 min)

### Problem
`SearchFilters.tsx`: SortSheet close button is 32×32px; ControlsBar view-toggle button is 34×34px. Both below 44px.

### Acceptance criteria
- Both buttons meet 44×44px minimum tap area.
- Visual appearance can remain at existing icon size.

### Implementation notes
- SortSheet close: change `width: 32, height: 32` → `minWidth: 44, minHeight: 44` and centre the inner X icon with flex.
- ControlsBar view-toggle: same approach — `width: 34, height: 34` → `minWidth: 44, minHeight: 44`.
- Run a visual check that the SortSheet header row doesn't overflow on 375px.

### Files
- `artifacts/vibe-app/src/components/SearchFilters.tsx`

---

## T04 — Fix NewArrivals fake gender filtering
Audit ref: P1-038
Severity: CRITICAL
Effort: S (30–60 min)

### Problem
`NewArrivals.tsx` gender tabs ("نسائي"/"رجالي") filter by array index modulo, not by real product category data. The filter is non-functional and potentially misleading.

### Acceptance criteria
- Option A (preferred): Remove gender tabs entirely and replace with a simpler "الكل / الأحدث" tab pair that actually sorts by `product.createdAt` or a stable field.
- Option B: If product data has a `gender` or `category` field, filter by that field.
- The "الأحدث" tab should sort by newest (index order, most recently added first) — currently it does.
- No data fetching changes required.

### Implementation notes
- Check the product type definition in `@workspace/api-client-react` to determine if a real `gender`/`category` field is available.
- If not available: remove "نسائي" and "رجالي" tabs; keep "الكل" and "الأحدث".
- The active tab underline animation and tab layout should remain.

### Files
- `artifacts/vibe-app/src/components/NewArrivals.tsx`
- `packages/api-client-react/src/` (product type definition — check only)

---

## T05 — Fix ProductDetailPage dot indicator layout-triggering animation
Audit ref: P1-023
Severity: CRITICAL
Effort: S (30–60 min)

### Problem
Gallery dot indicators in `ProductDetailPage.tsx` ~line 142 animate `width` between 6 and 18px, causing layout reflow on every frame.

### Acceptance criteria
- Active dot width animation uses CSS `transform: scaleX()` instead of `width` change.
- No visible difference in the final animated appearance.
- Animation timing remains 0.25s.

### Implementation notes
- Set fixed `width: 18` on all dots.
- Apply `transform: \`scaleX(${i === activeImage ? 1 : 0.33})\`` and `transformOrigin: "center"`.
- Ensure `overflow: hidden` or `borderRadius` clipping still works with the transform.
- Verify on 3 slides: active dot is full width, inactive dots appear narrow.

### Files
- `artifacts/vibe-app/src/pages/ProductDetailPage.tsx`

---

## T06 — Fix Header and SearchPage wishlist button touch targets
Audit ref: P1-031, P1-032
Severity: HIGH
Effort: XS (< 30 min)

### Problem
- `Header.tsx`: bell and user buttons are `w-9 h-9` = 36×36px.
- `SearchPage.tsx` ResultCardList wishlist button: 34×34px.

### Acceptance criteria
- All three buttons have a minimum 44×44px tap area.
- Visual ring/icon size may remain unchanged.

### Implementation notes
- Header buttons: change `w-9 h-9` → `w-11 h-11` (44px) or add `style={{ minWidth: 44, minHeight: 44 }}` while keeping inner content visually centred.
- SearchPage wishlist: change `width: 34, height: 34` → `minWidth: 44, minHeight: 44`.

### Files
- `artifacts/vibe-app/src/components/Header.tsx`
- `artifacts/vibe-app/src/pages/SearchPage.tsx`

---

## T07 — Fix Banner Slider "تسوق الآن" CTA touch target
Audit ref: P1-033
Severity: HIGH
Effort: XS (< 30 min)

### Problem
BannerSlider "تسوق الآن" button is approximately 22px tall (6px vertical padding + small font), well below the 44px minimum.

### Acceptance criteria
- Button rendered height is ≥ 44px, OR the button is wrapped with a transparent tap zone of ≥ 44px.
- CTA visual styling remains pill-shaped and on-brand.

### Implementation notes
- Change `py-1.5` to `py-3` (12px top + 12px bottom = at minimum 12px+12px+13px font = ~37px; add `minHeight: 44` to be safe).
- Verify the CTA does not visually overflow the banner card boundary (banner is 180px tall — a 44px button at the bottom should be fine).

### Files
- `artifacts/vibe-app/src/components/BannerSlider.tsx`

---

## T08 — Add checkout trust signals strip
Audit ref: P1-037
Severity: HIGH
Effort: S (30–60 min)

### Problem
`CheckoutPage.tsx` bottom CTA bar has no trust signals. At the highest-friction point in the funnel, nothing reassures hesitant users.

### Acceptance criteria
- A horizontal strip of 3 trust icons appears directly above the CTA button.
- Icons and microcopy: 🔒 "دفع آمن" | ✓ "منتجات أصلية" | ↩ "إرجاع مجاني".
- Font size: `var(--text-2xs)`. Icons: 12px. Background: transparent or `var(--gold-pale)`.
- No change to the CTA button itself or the order summary above.

### Implementation notes
- The `Features` component already provides identical content but is sized for the homepage. Do not reuse it directly — inline a compact 1-row version in the CheckoutPage bottom bar.
- Use `var(--text-muted)` for icon colour and text.
- Ensure the strip is above the "إتمام الطلب" button with 8px gap.

### Files
- `artifacts/vibe-app/src/pages/CheckoutPage.tsx`

---

## T09 — Fix AccordionRow max-height animation
Audit ref: P1-025
Severity: HIGH
Effort: S (30–60 min)

### Problem
`ProductDetailPage.tsx` `AccordionRow` uses `maxHeight: 0 → 300px` animation — layout-triggering and gives unnatural speed impression for short content.

### Acceptance criteria
- Accordion opens and closes with a smooth, content-height-aware animation.
- No layout reflow on animation frames.
- Timing: `0.3s ease` (existing).

### Implementation notes
- Replace `overflow: hidden; max-height` approach with CSS Grid row-height animation:
  ```css
  display: grid;
  grid-template-rows: 0fr; /* collapsed */
  grid-template-rows: 1fr; /* expanded */
  transition: grid-template-rows 0.3s ease;
  ```
- Inner content wrapper needs `overflow: hidden` and `min-height: 0`.
- This is a pure CSS change; no JS logic changes needed.

### Files
- `artifacts/vibe-app/src/pages/ProductDetailPage.tsx`

---

## T10 — Migrate Button component into active use (phased)
Audit ref: P1-016
Severity: CRITICAL (systemic)
Effort: L (multi-session, phased)

### Problem
The CVA `Button` component is fully implemented but unused across the entire codebase. Every button is a raw `<button>` with bespoke inline styles — no focus rings, no disabled states, no consistent hover behaviour.

### Acceptance criteria — Phase 1 (this sprint)
- At minimum, the 5 primary dark CTA buttons are migrated to `<Button variant="primary" size="lg">`:
  1. LoginSheet "تسجيل الدخول"
  2. CheckoutPage "إتمام الطلب"
  3. OrderSuccessPage "متابعة التسوق"
  4. OrdersPage empty state "تسجيل الدخول"
  5. WishlistPage empty state "ابدأ التسوق"
- Each migrated button gains correct focus ring, disabled state, and `active:scale-[0.97]` transform.

### Acceptance criteria — Phase 2 (next sprint)
- All secondary outline/ghost buttons migrated.
- All sheet close buttons migrated to `variant="ghost" size="icon"`.
- Raw `<button>` elements with inline styles should not exist outside of components with unique structural reasons (e.g. BottomNav tabs).

### Implementation notes
- Read `Button.tsx` variants carefully before migrating — `primary`, `outline`, `ghost`, `icon`, `icon-outline` already exist.
- Do not change the `Button.tsx` file itself unless a variant is missing.
- Migrate one page at a time to make PRs reviewable.

### Files
- `artifacts/vibe-app/src/components/ui/Button.tsx` (reference only)
- `artifacts/vibe-app/src/components/LoginSheet.tsx`
- `artifacts/vibe-app/src/pages/CheckoutPage.tsx`
- `artifacts/vibe-app/src/pages/OrderSuccessPage.tsx`
- `artifacts/vibe-app/src/pages/OrdersPage.tsx`
- `artifacts/vibe-app/src/pages/WishlistPage.tsx`

---

## T11 — Extract shared Stars component
Audit ref: P1-018
Severity: HIGH
Effort: S (30–60 min)

### Problem
Star rating UI is duplicated in 4 separate files with inconsistent sizes (8–13px) and strokeWidth (1.4–1.5).

### Acceptance criteria
- Single `<Stars>` component at `artifacts/vibe-app/src/components/ui/Stars.tsx`.
- Props: `rating: number`, `size?: number` (default 10), `showCount?: boolean`, `count?: number`.
- All 4 existing inline Stars definitions are removed and replaced with `<Stars>`.
- Sizes across cards become consistent: 10px for cards, 12px for product detail.

### Implementation notes
- Extract from `ProductDetailPage.tsx` as the most complete version (it has the most props).
- The star fill logic (full/half/empty) should live in the shared component.
- `TrendingSection` Stars are currently 8px — increase to 10px after migration.
- `FeaturedCard` Stars are 9px — increase to 10px after migration.

### Files
- `artifacts/vibe-app/src/components/ui/Stars.tsx` (create)
- `artifacts/vibe-app/src/pages/ProductDetailPage.tsx`
- `artifacts/vibe-app/src/components/FeaturedCard.tsx`
- `artifacts/vibe-app/src/components/TrendingSection.tsx`
- `artifacts/vibe-app/src/pages/SearchPage.tsx`

---

## T12 — Replace NewArrivals add-to-cart with CartButton
Audit ref: P1-019
Severity: HIGH
Effort: XS (< 30 min)

### Problem
`NewArrivals.tsx` add-to-cart button is a non-standard 32×32px raw button with hardcoded gradient and no success feedback.

### Acceptance criteria
- `NewArrivals` uses `<CartButton>` for add-to-cart, matching all other sections.
- Added state animation (checkmark, green) is consistent with DealCard and FeaturedCard.
- Touch target is ≥ 44px (CartButton already guarantees this).

### Implementation notes
- Import `CartButton` from `../components/CartButton`.
- The product's `selectedColor` should be the first available color if `product.colors` exists, else undefined.
- Remove the existing raw `<button>` at line ~104–108.

### Files
- `artifacts/vibe-app/src/components/NewArrivals.tsx`
- `artifacts/vibe-app/src/components/CartButton.tsx` (reference)

---

## T13 — Replace CheckoutPage local Field with shared Input
Audit ref: P1-017
Severity: HIGH
Effort: S (30–60 min)

### Problem
`CheckoutPage` defines its own `Field` component instead of using the shared `<Input>` from `ui/Input.tsx`, leading to visually inconsistent form fields.

### Acceptance criteria
- All form fields in CheckoutPage use `<Input>` from `ui/Input.tsx`.
- Labels appear above each input consistently.
- Border, radius, and font match LoginSheet fields exactly.
- Validation error display is preserved.

### Implementation notes
- The shared `Input` component accepts `label`, `error`, and all standard input props.
- CheckoutPage `Field` wrapper (`<div style={{ marginBottom: 14 }}>`) should remain but remove the inner `<input>` in favour of `<Input>`.
- Verify that the `dir="rtl"` on the input is inherited from the shared component (it applies `dir="rtl"` internally in label but NOT on the `<input>` itself — this is a separate bug tracked in the original audit; fix the `Input` to also set `dir="rtl"` on the inner `<input>` element).

### Files
- `artifacts/vibe-app/src/pages/CheckoutPage.tsx`
- `artifacts/vibe-app/src/components/ui/Input.tsx`

---

## T14 — Fix Input component missing dir="rtl" on inner input element
Audit ref: CheckoutPage audit note
Severity: HIGH
Effort: XS (< 30 min)

### Problem
`Input.tsx` sets `dir="rtl"` on the label and the wrapper but NOT on the `<input>` element itself. This means text cursor and caret position are LTR-anchored in input fields.

### Acceptance criteria
- The inner `<input>` element in `ui/Input.tsx` has `dir="rtl"`.
- Arabic text input is right-anchored; placeholder alignment is correct.
- No regression in English input contexts (if any exist — the app is Arabic-only, so this is safe).

### Implementation notes
- Add `dir="rtl"` to the `<input {...props}>` element in `Input.tsx`.
- This is a 1-line fix.

### Files
- `artifacts/vibe-app/src/components/ui/Input.tsx`

---

## T15 — Fix CollectionBanners: replace div[role=button] with native button
Audit ref: P1-022
Severity: HIGH
Effort: XS (< 30 min)

### Problem
`CollectionBanners.tsx` uses `<div role="button">` — not keyboard-activatable, ARIA antipattern.

### Acceptance criteria
- Outer clickable element is a native `<button>` with `type="button"`.
- Keyboard `Enter`/`Space` activates navigation to the search page.
- Visual appearance is unchanged (full-bleed 150px tall banner).

### Implementation notes
- Change `<div ... role="button">` to `<button type="button">`.
- Add `style={{ display: "block", width: "100%", border: "none", padding: 0, cursor: "pointer", background: "none" }}` to reset button defaults.
- `borderRadius`, `overflow: hidden`, and `height` are inherited from the container — verify after switch.
- Also increase the container touch area: min height should remain 150px (already meets 44px minimum since it's the full banner).

### Files
- `artifacts/vibe-app/src/components/CollectionBanners.tsx`

---

## T16 — Fix CollectionBanners and StickyBuyBar CTA touch targets
Audit ref: P1-034, P1-020 (partial)
Severity: MEDIUM
Effort: XS (< 30 min)

### Problem
- CollectionBanners CTA "تسوق الآن": padding `7px 16px` → ~28px height.
- StickyBuyBar buttons use `borderRadius: 12` instead of `var(--radius-md)`.

### Acceptance criteria
- CollectionBanners CTA button height ≥ 44px (add `minHeight: 44`).
- StickyBuyBar buttons use `borderRadius: "var(--radius-md)"`.
- StickyBuyBar success state uses `var(--success)` token instead of hardcoded `#5A8A4A`.

### Files
- `artifacts/vibe-app/src/components/CollectionBanners.tsx`
- `artifacts/vibe-app/src/components/StickyBuyBar.tsx`

---

## T17 — Fix pageEnter animation direction for RTL
Audit ref: P1-027
Severity: MEDIUM
Effort: XS (< 30 min)

### Problem
`index.css` `pageEnter` keyframe uses `translateX(16px)` — content slides in from the left, which is the "backwards" direction in RTL reading flow.

### Acceptance criteria
- New page content slides in from the right (correct "forward" direction for RTL users).
- `translateX(-16px)` makes content appear to come from the right side.
- Existing `ease-out` timing (0.25s) is unchanged.

### Implementation notes
- Change `transform: translateX(16px)` → `transform: translateX(-16px)` in `@keyframes pageEnter`.
- Test on: Home → ProductDetail (forward), and Back button (check no double-reverse happens since the back is via browser pop, not a new render).

### Files
- `artifacts/vibe-app/src/index.css`

---

## T18 — Fix StickyBuyBar hardcoded shadow and token bypasses
Audit ref: `StickyBuyBar` audit notes
Severity: MEDIUM
Effort: XS (< 30 min)

### Problem
`StickyBuyBar` uses hardcoded `boxShadow: "0 -6px 24px rgba(0,0,0,0.1)"` instead of a shadow token. This shadow is also not in the token set — it should be added as `--shadow-sticky` or reuse `--shadow-card` with `-Y` direction.

### Acceptance criteria
- StickyBuyBar shadow is defined as a token `--shadow-sticky: 0 -6px 24px rgba(0,0,0,0.1)` in `index.css`.
- The component references `var(--shadow-sticky)` instead of the hardcoded value.

### Files
- `artifacts/vibe-app/src/components/StickyBuyBar.tsx`
- `artifacts/vibe-app/src/index.css`

---

## T19 — Fix Features component hardcoded icon color
Audit ref: `Features.tsx` audit note
Severity: MEDIUM
Effort: XS (< 15 min)

### Problem
`Features.tsx` hardcodes `color: "#7A5200"` for all feature icons. Should use `var(--text-brand)` to respond correctly to theming and dark mode.

### Acceptance criteria
- All 3 feature icons use `color: "var(--text-brand)"`.
- Title `<span>` uses `color: "var(--text-primary)"` instead of `"#2E2C2A"`.

### Files
- `artifacts/vibe-app/src/components/Features.tsx`

---

## T20 — Fix OrdersPage borderLeft RTL bug
Audit ref: P1-008
Severity: MEDIUM
Effort: XS (< 15 min)

### Problem
`OrdersPage.tsx` line 138: `borderLeft: "1px solid var(--border)"` renders on the wrong side in RTL layout.

### Acceptance criteria
- Divider between action buttons uses `borderInlineStart` (logical CSS property).
- Visually, the divider separates "تفاصيل الطلب" from "إعادة الطلب" on the correct side.

### Files
- `artifacts/vibe-app/src/pages/OrdersPage.tsx`

---

## T21 — Fix ProductDetailPage hardcoded colors for dark mode compatibility
Audit ref: P1-015
Severity: MEDIUM
Effort: S (30–60 min)

### Problem
`ProductDetailPage.tsx` uses `"#1E1C1A"`, `"#2E2C2A"`, `"#4A4846"`, `"#6A6764"`, `"#F0F8F0"`, `"#C03030"`, `"#4A7A3A"` as hardcoded hex values throughout. These will not adapt to dark mode.

### Acceptance criteria
- All hardcoded neutrals replaced with CSS variable equivalents:
  - `#1E1C1A` / `#2E2C2A` → `var(--text-primary)`
  - `#4A4846` → `var(--text-secondary)`
  - `#6A6764` → `var(--text-muted)`
  - `#F0F8F0` → reuse `var(--success-bg)` or define `var(--bg-success-light)`
  - `#C03030` → `var(--error)` or `var(--destructive)`
  - `#4A7A3A` → `var(--success)`

### Files
- `artifacts/vibe-app/src/pages/ProductDetailPage.tsx`

---

## T22 — Fix AccountPage title dark mode token bypass
Audit ref: P1-014
Severity: MEDIUM
Effort: XS (< 15 min)

### Problem
`AccountPage.tsx` line 109 uses `text-[#2E2C2A]` Tailwind arbitrary class — won't change in dark mode.

### Acceptance criteria
- Text colour uses `style={{ color: "var(--text-primary)" }}` instead.

### Files
- `artifacts/vibe-app/src/pages/AccountPage.tsx`

---

## T23 — Fix Escape key dismiss for SortSheet and FilterSheet
Audit ref: P1-028
Severity: MEDIUM
Effort: XS (< 30 min)

### Problem
Neither `SortSheet` nor `FilterSheet` respond to the `Escape` key. Keyboard users have no exit path.

### Acceptance criteria
- Pressing `Escape` while a sheet is open triggers `onClose()`.
- A `useEffect` cleanup removes the listener when the component unmounts.
- Focus is returned to the trigger button on close (optional enhancement, but recommended).

### Implementation notes
```typescript
useEffect(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}, [onClose]);
```

### Files
- `artifacts/vibe-app/src/components/SearchFilters.tsx`

---

## T24 — Fix typography token adoption across all pages
Audit ref: P1-011, P1-013
Severity: MEDIUM
Effort: M (1–2 hours)

### Problem
Widespread off-scale font sizes (`9.5px`, `11.5px`, `12.5px`, `13.5px`, `17px`) across TrendingSection, SearchPage, CartPage, OrdersPage, CheckoutPage, and StickyBuyBar.

### Acceptance criteria
- No inline `fontSize` value that doesn't map to a defined token in `index.css`.
- Mapping to apply:
  - `9.5px` → `var(--text-2xs)` (clamp 8.5–10px)
  - `10px` → `var(--text-2xs)` or `var(--text-xs)` (clamp 10–12px)
  - `11.5px` → `var(--text-xs)`
  - `12px` → `var(--text-xs)` or `var(--text-sm)`
  - `12.5px` → `var(--text-sm)`
  - `13.5px` / `14px` → `var(--text-base)`
  - `17px` → `var(--text-lg)`

### Files
- `artifacts/vibe-app/src/components/TrendingSection.tsx`
- `artifacts/vibe-app/src/pages/SearchPage.tsx`
- `artifacts/vibe-app/src/pages/CartPage.tsx`
- `artifacts/vibe-app/src/pages/OrdersPage.tsx`
- `artifacts/vibe-app/src/pages/CheckoutPage.tsx`
- `artifacts/vibe-app/src/components/StickyBuyBar.tsx`

---

## T25 — Fix spacing irregularities (off-grid values)
Audit ref: P1-001, P1-002, P1-003, P1-007
Severity: MEDIUM
Effort: M (1–2 hours)

### Problem
Multiple components use padding values not on the 4px grid: `9px`, `11px`, `14px` padding inside card content areas, section wrappers, and the StickyBuyBar.

### Acceptance criteria
- All padding values in `TrendingSection.tsx`, `NewArrivals.tsx`, `StickyBuyBar.tsx`, `ProductDetailPage.tsx`, and `App.tsx` are multiples of 4px.
- Double padding issue with `Features` component (P1-005) is resolved.

### Files
- `artifacts/vibe-app/src/components/TrendingSection.tsx`
- `artifacts/vibe-app/src/components/NewArrivals.tsx`
- `artifacts/vibe-app/src/components/StickyBuyBar.tsx`
- `artifacts/vibe-app/src/pages/ProductDetailPage.tsx`
- `artifacts/vibe-app/src/App.tsx`
- `artifacts/vibe-app/src/components/Features.tsx`

---

## T26 — Fix Header and BottomNav bg-white → token
Audit ref: P1-006
Severity: LOW
Effort: XS (< 15 min)

### Problem
`Header.tsx` and `BottomNav.tsx` use `bg-white` Tailwind class, relying on a fragile `!important` CSS override for dark mode.

### Acceptance criteria
- Both components use `style={{ background: "var(--bg-card)" }}` instead of `bg-white`.
- The `!important` override in `index.css` for `bg-white` can be removed as a follow-up once no other components use it.

### Files
- `artifacts/vibe-app/src/components/Header.tsx`
- `artifacts/vibe-app/src/components/BottomNav.tsx`

---

## T27 — Fix Header hover state hardcoded hex
Audit ref: P1-021
Severity: LOW
Effort: XS (< 15 min)

### Problem
`Header.tsx` bell button hover uses `hover:bg-[#fdf6ec]` — won't adapt to dark mode. Adjacent user button already uses `hover:bg-[var(--gold-pale)]`.

### Acceptance criteria
- Bell button hover: `hover:bg-[#fdf6ec]` → `hover:bg-[var(--gold-pale)]`.

### Files
- `artifacts/vibe-app/src/components/Header.tsx`

---

## T28 — Fix WishlistPage discount badge conditional rendering
Audit ref: P1-040
Severity: MEDIUM
Effort: XS (< 15 min)

### Problem
`WishlistPage.tsx` always renders the discount badge — even when `item.discount === 0`, showing a "0%" badge.

### Acceptance criteria
- Discount badge only renders when `item.discount > 0`.
- Format matches `DealCard`: `خصم ${item.discount}%` (include the "خصم" prefix).

### Files
- `artifacts/vibe-app/src/pages/WishlistPage.tsx`

---

## T29 — Fix CollectionBanners border radius to use token
Audit ref: P1-004
Severity: LOW
Effort: XS (< 15 min)

### Problem
`CollectionBanners.tsx` hardcodes `borderRadius: 18`. Token scale has `--radius-card` (16px) and `--radius-lg` (20px), not 18px.

### Acceptance criteria
- `borderRadius: 18` → `borderRadius: "var(--radius-lg)"` (20px — closest match and consistent with other large cards).

### Files
- `artifacts/vibe-app/src/components/CollectionBanners.tsx`

---

## T30 — Fix Input.tsx typography token (max 14px → 15px)
Audit ref: P1-010
Severity: MEDIUM
Effort: XS (< 15 min)

### Problem
`Input.tsx` line 73: `fontSize: "clamp(13px,3.6vw,14px)"` — max is 14px instead of 15px, mismatching `--text-base`.

### Acceptance criteria
- Changed to `fontSize: "var(--text-base)"` to exactly match the token.

### Files
- `artifacts/vibe-app/src/components/ui/Input.tsx`

---

## T31 — Fix RelatedProduct card hover transition (instant snap)
Audit ref: P1-026
Severity: MEDIUM
Effort: XS (< 15 min)

### Problem
`ProductDetailPage.tsx` related product cards use direct style mutation on `onMouseEnter`/`onMouseLeave` with no transition, causing instant transform snaps.

### Acceptance criteria
- `transform` change is animated with `transition: "transform 0.15s ease"` on the button base style.
- No visual change when not hovering; lift animation (translateY -2px) is smooth.

### Files
- `artifacts/vibe-app/src/pages/ProductDetailPage.tsx`

---

## T32 — Fix NotificationsPage body text line-height for Arabic
Audit ref: P1-012
Severity: MEDIUM
Effort: XS (< 15 min)

### Problem
`NotificationsPage.tsx` notification body text has `lineHeight: 1.5` — below the 1.6 minimum for Arabic multi-line text.

### Acceptance criteria
- Notification body text changed to `lineHeight: 1.65`.

### Files
- `artifacts/vibe-app/src/pages/NotificationsPage.tsx`

---

## T33 — Add product error state recovery suggestions
Audit ref: P1-039
Severity: MEDIUM
Effort: M (30–60 min)

### Problem
`ProductDetailPage` error state is a dead end with no contextual recovery (no related products, no category link).

### Acceptance criteria
- Below the "تصفح المنتجات" button, add a mini strip: "قد تُعجبك هذه المنتجات" with 4 product cards reusing the existing `useGetProducts` hook.
- Cards use `DealCard` or a simplified card variant.
- If products are loading, show a skeleton placeholder row.

### Files
- `artifacts/vibe-app/src/pages/ProductDetailPage.tsx`
- `artifacts/vibe-app/src/components/DealCard.tsx` (reference)

---

## Execution order summary

| Phase | Tasks | Rationale |
|---|---|---|
| **1 — Immediate blockers** | T01, T02, T03, T04, T05 | Critical issues: live trust failure, WCAG violations, non-functional UI |
| **2 — Ergonomics & accessibility** | T06, T07, T14, T15, T20, T23 | All touch target and keyboard access gaps |
| **3 — Component consistency** | T08, T09, T10, T11, T12, T13 | CTA trust, animations, shared components |
| **4 — Token compliance** | T16, T17, T18, T19, T21, T22 | Design system hygiene |
| **5 — Polish** | T24, T25, T26, T27, T28, T29, T30, T31, T32, T33 | Typography, spacing, UX improvements |

Estimated total effort: **~16–24 hours** across all phases.
Phases 1–2 can be completed in a single focused session (~4 hours).
