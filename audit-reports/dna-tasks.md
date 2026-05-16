TASK PLAN — DESIGN DNA
─────────────────────────────────────────────────────────────────────────────
Generated: 2026-05-13
Source: /DESIGN_DNA.md
─────────────────────────────────────────────────────────────────────────────

[1] | Fix WCAG touch-target violation in FlashSale add-to-cart button (30px → 44px wrapper) | artifacts/vibe-app/src/components/FlashSale.tsx | Active touch area is 30×30px; WCAG 2.5.5 requires 44×44px minimum — same pattern already solved in CartButton.tsx | Risk: L

[2] | Set dir="rtl" globally on <html> in index.html | artifacts/vibe-app/index.html | Currently applied per-component; missing it on a new component causes layout/text direction bugs silently | Risk: L

[3] | Consolidate @theme and :root token declarations — remove @theme block or align naming to --color-* | artifacts/vibe-app/src/index.css | Two parallel token systems (--gold vs --color-gold) create confusion; @theme block is unused by all components | Risk: M

[4] | Add missing radius token --radius-xl (20–24px) for bottom sheets and modal-level radii | artifacts/vibe-app/src/index.css, artifacts/vibe-app/src/lib/designTokens.ts | 20px and 24px bottom-sheet radii are hardcoded in 4+ components; token does not exist yet | Risk: L

[5] | Replace all hardcoded border-radius values in DealCard and FeaturedCard with CSS var tokens | artifacts/vibe-app/src/components/DealCard.tsx, artifacts/vibe-app/src/components/FeaturedCard.tsx | rounded-2xl (Tailwind) maps to 16px = --radius-card; making it explicit prevents drift if the token value changes | Risk: L

[6] | Replace hardcoded border-radius values in TrendingSection and NewArrivals cards with --radius-card | artifacts/vibe-app/src/components/TrendingSection.tsx, artifacts/vibe-app/src/components/NewArrivals.tsx | Both use 16px inline — token exists but is bypassed | Risk: L

[7] | Replace hardcoded border-radius in LoginSheet (12px container, 14px submit button, 20px handle) with tokens | artifacts/vibe-app/src/components/LoginSheet.tsx | 12px ≈ --radius-md (14px), 14px = --radius-md, 20px = --radius-lg; three hardcoded values in one file | Risk: L

[8] | Create shared <Input> primitive with unified radius, border, background, and focus tokens | artifacts/vibe-app/src/components/SearchBar.tsx, artifacts/vibe-app/src/components/LoginSheet.tsx | Two separate input implementations with different radius (rounded-2xl vs 12px), border color (#E8E4DE vs transparent), and bg token (--input-bg vs --input-bg-soft) | Risk: M

[9] | Replace hardcoded shadow in StickyBuyBar with a new --shadow-sticky token or existing --shadow-sheet | artifacts/vibe-app/src/components/StickyBuyBar.tsx, artifacts/vibe-app/src/index.css | `0 -6px 24px rgba(0,0,0,0.1)` is one-off; --shadow-sheet exists for this pattern | Risk: L

[10] | Replace hardcoded shadow in card-pressable hover rule with --shadow-md token | artifacts/vibe-app/src/index.css | `0 4px 12px rgba(192,168,130,0.20)` is unique; --shadow-md is the closest token and should be used | Risk: L

[11] | Replace hardcoded rank badge shadow in TrendingSection with --shadow-sm | artifacts/vibe-app/src/components/TrendingSection.tsx | `0 2px 6px rgba(0,0,0,0.15)` matches --shadow-sm intent; hardcoded value does not adapt to dark mode | Risk: L

[12] | Replace OrderSuccess checkmark circle hardcoded shadow with --shadow-success | artifacts/vibe-app/src/pages/OrderSuccessPage.tsx | `0 8px 32px rgba(90,138,74,0.35)` is a success-colored shadow — --shadow-success token already exists | Risk: L

[13] | Replace hardcoded bottom-sheet shadow in index.css with --shadow-sheet | artifacts/vibe-app/src/index.css | `.bottom-sheet` rule uses `0 -8px 32px rgba(0,0,0,0.15)` instead of the defined --shadow-sheet token | Risk: L

[14] | Migrate FlashSale card to use design tokens for bg, border, and text colors | artifacts/vibe-app/src/components/FlashSale.tsx | Uses 8+ hardcoded rgba/hex values not mapped to any token; dark section cannot respond to future theme changes | Risk: M

[15] | Migrate FlashSale header discount badge from hardcoded #FF3D3D to --error token | artifacts/vibe-app/src/components/FlashSale.tsx | #FF3D3D is a unique value; --error (#E04545) is the project-wide error/discount color and should be used | Risk: L

[16] | Consolidate SearchBar background from hardcoded #F5F5F5 to var(--input-bg) | artifacts/vibe-app/src/components/SearchBar.tsx | --input-bg is defined as #F5F5F5 but is not referenced; hardcoded hex breaks dark mode adaptation | Risk: L

[17] | Add motion duration and easing tokens to :root (--duration-fast, --duration-base, --duration-slow, --ease-standard, --ease-spring) | artifacts/vibe-app/src/index.css | 10+ distinct transition duration values in use with no system; a 3-step scale would cover ~90% of cases | Risk: M

[18] | Normalize transition durations in BottomNav, Categories, and BannerSlider to the new motion token scale | artifacts/vibe-app/src/components/BottomNav.tsx, artifacts/vibe-app/src/components/Categories.tsx, artifacts/vibe-app/src/components/BannerSlider.tsx | These three components use 0.2–0.3s with different easings that should unify once tokens exist (blocked by Task 17) | Risk: L

[19] | Normalize transition durations in LoginSheet, OrderSuccessPage, and ProductDetailPage to the motion token scale | artifacts/vibe-app/src/components/LoginSheet.tsx, artifacts/vibe-app/src/pages/OrderSuccessPage.tsx, artifacts/vibe-app/src/pages/ProductDetailPage.tsx | 0.25s–0.5s range with 3 different easings; should map to --duration-base and --ease-spring (blocked by Task 17) | Risk: L

[20] | Create CVA-based Button component with typed variants: primary | outline | ghost | circle | tab | artifacts/vibe-app/src/components/Button.tsx, artifacts/vibe-app/src/lib/utils.ts | Zero CVA usage despite being in the declared stack; 10+ button patterns exist as scattered inline styles with no type safety | Risk: H

[21] | Create a typography utility system (Heading, Label, Caption, Price components or className helpers) | artifacts/vibe-app/src/lib/designTokens.ts, artifacts/vibe-app/src/index.css | No semantic heading scale exists; H1/H2/H3 sizing is repeated inline in every component; Arabic line-heights are inconsistent across heading-level text | Risk: M

─────────────────────────────────────────────────────────────────────────────
Total: 21 tasks

Priority breakdown:
  CRITICAL : 0
  HIGH     : 1   (Task 20 — CVA Button system)
  MEDIUM   : 4   (Tasks 3, 8, 14, 17, 21)
  LOW      : 16  (Tasks 1, 2, 4–7, 9–13, 15–16, 18–19)

Order note: Tasks 18 and 19 are blocked by Task 17 (motion tokens must exist first).
All other tasks are independent and may be executed in any order within their priority tier.
─────────────────────────────────────────────────────────────────────────────
