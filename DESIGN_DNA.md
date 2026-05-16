# DESIGN DNA
Extracted: 2026-05-13
Stack: React 18, Vite, TypeScript, TailwindCSS v4 (@theme), clsx, tailwind-merge
App: artifacts/vibe-app — Arabic-first mobile e-commerce (max-width: 430px)

---

## Spacing System

**Base Grid:** 4px (tokens defined in `designTokens.ts`; mixed application in practice)

| Token | px Value |
|-------|----------|
| xs    | 4px      |
| sm    | 8px      |
| md    | 12px     |
| lg    | 16px     |
| xl    | 20px     |
| xxl   | 24px     |
| xxxl  | 32px     |

**Tailwind utilities in use:** `px-2`, `px-3`, `px-4`, `py-1`, `py-2`, `py-2.5`, `pt-2`, `pt-3`, `pb-2`, `gap-1`, `gap-1.5`, `gap-2`, `gap-3`, `gap-8`, `gap-10`

**Hardcoded px values also present in inline styles:** 9, 10, 11, 13, 14, 22, 28px — not drawn from the token scale.

Assessment: **Partially consistent** — designTokens.ts defines a clean 4px-grid scale, but components mix Tailwind utilities, token variables, and ad-hoc hardcoded pixel values freely.

---

## Typography System

**Font Family:** `'Tajawal', sans-serif` (Arabic-first, declared as `--font-main` / `--color-*` in both `@theme` and `:root`)

**Fluid Scale (CSS clamp — from `:root`):**

| Token         | Min     | Max    | Usage                   |
|---------------|---------|--------|-------------------------|
| --text-2xs    | 8.5px   | 10px   | Brand label, badges     |
| --text-xs     | 10px    | 12px   | Secondary captions      |
| --text-sm     | 11px    | 13px   | Body text, inputs       |
| --text-base   | 13px    | 15px   | Primary body, prices    |
| --text-lg     | 14px    | 17px   | Section labels          |
| --text-xl     | 18px    | 22px   | Page headings           |
| --text-price-lg | 24px  | 28px   | Large price display     |

**Fixed sizes also used (inline styles, not via tokens):** 9, 9.5, 10, 11, 11.5, 12, 13, 14, 15, 16, 18, 22, 24px

**Weights in use:**

| Value | Token name  | Usage                          |
|-------|-------------|--------------------------------|
| 400   | regular     | Body, secondary                |
| 500   | medium      | Nav labels (inactive)          |
| 600   | semibold    | Card names, section labels     |
| 700   | bold        | Prices, badges, brand names    |
| 800   | extrabold   | Page titles, counters          |
| 900   | black       | Brand logo ("نخبة")            |

**Line-heights used:** `1` (tight labels), `1.15` (brand logo), `1.3–1.35` (card names), `1.5` (category labels), `1.6–1.7` (body paragraphs, product descriptions)

**Heading hierarchy:** No semantic H1→H2→H3 scale. Sizes are applied contextually per-component with no shared heading component or class.

**Arabic assessment:** Tajawal is well-suited for Arabic. Line-heights ≥ 1.3 are used for multi-line Arabic text (product names, descriptions). Tight line-height of `1` is only used on single-line labels — acceptable. No RTL-specific rendering issues observed. `dir="rtl"` is set at component level (not globally on `<html>`).

Assessment: **Partially consistent** — fluid clamp scale exists but is bypassed by many components using fixed pixel values.

---

## Color System

### Brand / Gold

| Token                   | Value       | Role                          |
|-------------------------|-------------|-------------------------------|
| --gold                  | #C0A882     | Primary brand, icons, borders |
| --gold-dark             | #9a6e00     | Gradient endpoint             |
| --gold-mid              | #c9a84c     | Mid gradient                  |
| --gold-light            | #F5E8D4     | Soft tint backgrounds         |
| --gold-pale             | #fdf6ec     | Hover states                  |
| --gold-accent           | #B8922A     | Gradient endpoint, focus      |
| --gold-gradient-start   | #d4b896     | CartButton gradient start     |
| --gold-warm             | #D4AF37     | Stars, flash price            |

### Text

| Token            | Value   | Role                     |
|------------------|---------|--------------------------|
| --text-primary   | #2E2C2A | Primary body text        |
| --text-secondary | #5A5856 | Secondary/muted body     |
| --text-muted     | #767676 | Placeholder, captions    |
| --text-price     | #1E1C1A | Price values             |
| --text-brand     | #8B6310 | Brand labels, CTA text   |

### Surfaces

| Token                | Value   | Role                        |
|----------------------|---------|-----------------------------|
| --bg-body            | #DEDCD9 | Outer container / browser   |
| --bg-page            | #F3F2F1 | App shell background        |
| --bg-card            | #FFFFFF | Cards, sheets, nav bar      |
| --bg-surface-warm    | #FAFAF8 | Input backgrounds           |
| --bg-surface-subtle  | #FAF8F5 | Subtle section backgrounds  |
| --bg-cta-dark        | #1E1C1A | Dark CTA buttons            |
| --card-bg            | #F8F7F6 | Card variant (warm white)   |

### Borders

| Token              | Value                    | Role                     |
|--------------------|--------------------------|--------------------------|
| --border           | #EEEEEE                  | Default dividers         |
| --border-warm      | #F0EDE8                  | Warm dividers            |
| --border-separator | #F4F2EE                  | Section separators       |
| --card-border      | rgba(192,168,130,0.35)   | Card outlines            |

### Semantic

| Token          | Value   | Role                        |
|----------------|---------|-----------------------------|
| --success      | #5A8A4A | Success states, add-to-cart |
| --error        | #E04545 | Error messages, badges      |
| --discount-bg  | #F5E8E1 | Discount badge background   |
| --discount-text| #A15A49 | Discount badge text         |

### Dark Mode

Status: **Full** — complete dark mode override via `@media (prefers-color-scheme: dark)` in `index.css`. All surface, text, border, shadow, and gold tokens are redefined. One override rule: `.bg-white { background-color: var(--bg-card) !important; }`.

### Token Declaration Duplication

⚠️ Tokens are declared **twice**:
1. `@theme` block (Tailwind v4 — exposes as `bg-gold`, `text-gold`, etc.) using `--color-gold` naming
2. `:root` block (CSS vars — used by all components) using `--gold` naming

Components universally use the `:root` convention (`var(--gold)`), never the `@theme` Tailwind utilities. The `@theme` block defines only a subset of tokens (missing `--bg-body`, `--bg-cta-dark`, several border tokens, all shadow-feature/glow tokens).

---

## Surface & Elevation Model

**Layers (light mode, bottom to top):**

| Layer | Token          | Value   | Used in                          |
|-------|----------------|---------|----------------------------------|
| 0     | --bg-body      | #DEDCD9 | HTML/body — outer frame          |
| 1     | --bg-page      | #F3F2F1 | App shell, page backgrounds      |
| 2     | --bg-card      | #FFFFFF | Cards, nav bar, sheets           |
| 2alt  | --card-bg      | #F8F7F6 | DealCard (slightly warm variant) |
| 3     | --bg-surface-warm / --bg-surface-subtle | #FAFAF8 / #FAF8F5 | Input fields, order header |
| 4     | --bg-cta-dark  | #1E1C1A | Dark buttons (inverted layer)    |

**Elevation method:** Mixed
- **Shadows** (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-sheet`, `--shadow-feature`, `--shadow-success`, `--shadow-glow`) for modals, sheets, featured elements
- **Borders** (`--card-border`, `--border-warm`, `--gold` 1px) for card containment
- **Background shifts** (body → page → card → surface-warm) for layer separation

---

## Radius System

**Defined tokens:**

| Token        | Value      | px (approx) |
|--------------|------------|-------------|
| --radius-sm  | 0.5rem     | 8px         |
| --radius-md  | 0.875rem   | 14px        |
| --radius-lg  | 1.25rem    | 20px        |
| --radius-card| 1rem       | 16px        |

**Tailwind utilities in use:** `rounded-2xl` (16px), `rounded-full`, `rounded-lg` (8px)

**Hardcoded values in inline styles (bypassing tokens):** 2px (handles/bars), 8px, 12px, 14px, 18px, 20px, 24px (bottom sheets), 50% (circles)

**Special cases:**
- Bottom sheets: `20px 20px 0 0` or `24px 24px 0 0` (hardcoded, no token)
- Countdown boxes: 8px (hardcoded)
- Filter tabs: 20px rounded-full (hardcoded)
- Discount badges: 20px (hardcoded)

Assessment: **Mixed** — token system exists and is correct, but components frequently hardcode radius values that should map to existing tokens.

---

## Shadow System

**Defined tokens (`:root`):**

| Token             | Value                                                                 | Usage                       |
|-------------------|-----------------------------------------------------------------------|-----------------------------|
| --shadow-sm       | 0 1px 3px rgba(0,0,0,0.04)                                           | Subtle lift                 |
| --shadow-md       | 0 3px 8px rgba(192,168,130,0.38)                                     | CartButton, card hovers     |
| --shadow-lg       | 0 0 80px rgba(0,0,0,0.20)                                            | App shell outer glow        |
| --shadow-sheet    | 0 -4px 40px rgba(0,0,0,0.12)                                         | Bottom sheets               |
| --shadow-feature  | 0 1px 6px rgba(192,168,130,0.1), 0 0 0 1px rgba(192,168,130,0.12)   | Feature sections            |
| --shadow-success  | 0 2px 8px rgba(90,160,90,0.32)                                       | Success states              |
| --shadow-glow     | 0 0 8px rgba(180,120,0,0.45)                                         | Active category glow        |

**Hardcoded shadow values found in components (not using tokens):**
- `0 -6px 24px rgba(0,0,0,0.1)` — StickyBuyBar
- `0 4px 12px rgba(192,168,130,0.20)` — card-pressable hover (in CSS)
- `0 2px 6px rgba(0,0,0,0.15)` — rank badges (TrendingSection)
- `0 8px 32px rgba(90,138,74,0.35)` — OrderSuccess checkmark circle
- `0 -8px 32px rgba(0,0,0,0.15)` — bottom-sheet in CSS
- `inset 0 1px 0 rgba(255,255,255,0.22)` — CartButton inset highlight (combined with --shadow-md)

Token-based: **Partial** — tokens defined and partially used, but several one-off values exist in components.

---

## Motion System

**Note:** Framer Motion is listed in the stack but is **not used anywhere** in the codebase. All animation is done via CSS keyframes + inline `transition` styles.

### CSS Keyframe Animations (index.css)

| Name            | Duration | Easing                                    | Usage                        |
|-----------------|----------|-------------------------------------------|------------------------------|
| fadeInUp        | 0.18s    | ease                                      | Sheet overlay entrance       |
| slideUp         | 0.28–0.3s| cubic-bezier(0.25, 0.46, 0.45, 0.94)     | Bottom sheets, sticky bar    |
| newBadgePulse   | 2.2s     | ease-in-out (infinite)                    | NEW badge pulse ring         |
| confettiFall    | 1.6s     | ease-in                                   | Order success confetti       |
| heartPop        | 0.4s     | cubic-bezier(0.175, 0.885, 0.32, 1.275)  | Wishlist heart press         |
| staggerFade     | 0.3s     | ease (delays: 0.05–0.20s)                 | Card grid stagger entrance   |
| pageEnter       | 0.22s    | ease                                      | Page transitions             |
| spin            | 0.7s     | linear (infinite)                         | Page spinner                 |

### CSS Transition Values (inline styles across components)

| Duration | Easing                                      | Location                                |
|----------|---------------------------------------------|-----------------------------------------|
| 0.15s    | ease                                        | card-pressable, skip-link               |
| 0.18s    | ease                                        | SearchBar border/icon color             |
| 0.2s     | ease                                        | Categories gradient, filter tabs, input focus |
| 0.25s    | ease                                        | LoginSheet backdrop, BottomNav opacity  |
| 0.28s    | cubic-bezier(0.25, 0.46, 0.45, 0.94)       | StickyBuyBar slideUp                    |
| 0.3s     | ease                                        | BottomNav indicator, banner dots, accordion |
| 0.32s    | cubic-bezier(0.25, 0.46, 0.45, 0.94)       | ImageGallery swipe                      |
| 0.35s    | cubic-bezier(0.32, 0.72, 0, 1)             | LoginSheet slide                        |
| 0.4s     | ease                                        | OrderSuccess elements                   |
| 0.5s     | ease                                        | Banner slide opacity, checkmark         |
| 0.5s     | cubic-bezier(0.175, 0.885, 0.32, 1.275)    | OrderSuccess circle scale               |

**Tailwind animate utilities in use:** `animate-pulse` (loading skeletons), `animate-spin` (loader icon), `transition-colors`, `transition-opacity`

Assessment: **Scattered** — no unified timing philosophy. 10+ distinct duration values, 5 distinct easing curves. No motion token system. Framer Motion imported in stack but absent from code.

---

## Component Patterns

### Button Variants

No CVA is used. All button variants are bespoke inline styles. Identified recurring patterns:

| Variant                  | Background                                      | Color          | Border                        | Radius    | Min Touch |
|--------------------------|-------------------------------------------------|----------------|-------------------------------|-----------|-----------|
| Primary dark             | `linear-gradient(135deg, #1E1C1A, #2E2C2A)`     | #fff           | none                          | 12–14px   | 44px      |
| Gold outline             | transparent                                     | --text-brand   | 1.5px solid --gold            | 12–14px   | 44px      |
| Gold circle (CartButton md) | `linear-gradient(135deg, gold-gradient-start, gold, gold-accent)` | — | none             | 50%       | 44px (wrapper) |
| Gold circle (CartButton sm) | same gradient                               | —              | none                          | 50%       | 44px (wrapper) |
| Success circle           | `linear-gradient(135deg, --success, #4a8a4a)`   | —              | none                          | 50%       | 44px      |
| Icon ghost               | transparent                                     | --gold         | none                          | 50%       | 36–44px   |
| Filter tab (active)      | `linear-gradient(135deg, #1E1C1A, #2E2C2A)`     | #fff           | none                          | 20px      | —         |
| Filter tab (inactive)    | --bg-card                                       | --text-secondary | 1px solid --border-warm      | 20px      | —         |
| CTA dark rounded-lg      | --bg-cta-dark                                   | #fff           | none                          | rounded-lg| —         |
| Text link                | transparent                                     | --text-brand   | none                          | —         | —         |
| Flash add-to-cart circle | --gold                                          | #1E1C1A        | none                          | 50%       | ⚠️ 30px only |

**Inconsistency:** Flash sale add-to-cart button is 30×30px — below the 44px WCAG touch target used by all other CartButton instances.

### Input Patterns

**SearchBar:**
- Container: `rounded-2xl`, bg `#F5F5F5` (hardcoded, should be `--input-bg`)
- Border: `1px solid transparent` → `1.5px solid var(--gold)` on focus
- Icon: left-side (RTL = visually right), color shifts from `--text-muted` to `--gold-accent` on focus
- Transition: `0.18s ease` on border-color and icon color
- Font: `clamp(11px, 3.2vw, 13px)` (not from token scale)

**LoginSheet Field:**
- Container: `borderRadius: 12px` (hardcoded, ≈ `--radius-md`)
- Border: `1.5px solid #E8E4DE` (hardcoded) → `var(--gold)` on focus (JS inline style toggle)
- Background: `var(--input-bg-soft)`
- Padding: `13px 42px` (icon space)
- Font: `14px` (hardcoded, between --text-sm and --text-base)

**Inconsistency:** Two different input patterns with different radius, border color, bg token, and font size. No shared input component.

### Card Patterns

| Card              | Component        | Radius          | Background      | Border                      | Image Ratio | Padding     |
|-------------------|------------------|-----------------|-----------------|------------------------------|-------------|-------------|
| Deal (horizontal) | DealCard         | rounded-2xl (16px) | --card-bg    | 1px solid var(--gold)        | 1/0.95      | px-2 pt-1.5 pb-2 |
| Featured (grid)   | FeaturedCard     | rounded-2xl (16px) | --card-bg    | 1px solid var(--card-border) | 1/1         | px-2.5 pt-2 pb-2.5 |
| Trending          | TrendingSection  | 16px (hardcoded) | --card-bg    | 1px solid var(--card-border) | 1/1         | 9px 10px 11px |
| New Arrivals      | NewArrivals      | 16px (hardcoded) | --card-bg    | 1px solid var(--card-border) | 1/1         | 9px 10px 11px |
| Flash Sale        | FlashSale        | 14px (hardcoded) | rgba(255,255,255,0.07) | 1px solid rgba(255,255,255,0.1) | 1/1 | 9px 10px 10px |

**All cards share:** `.card-pressable` class (hover shadow + active scale(0.975)), `.gold-divider` between image and content.

**Inconsistency:** DealCard uses gold border (`var(--gold)`) while all other cards use the subtle `--card-border`. FlashSale card is a completely separate dark-theme visual system.

---

## Critical Notes

1. **@theme / :root duplication** — Tailwind v4 `@theme` declares `--color-gold` naming, but all 50+ component files use `var(--gold)` (`:root` convention). The `@theme` block is effectively unused at the component level. Risk: future developer adds `bg-gold` Tailwind utilities expecting design-system alignment, but the values are identical — currently harmless but creates confusion.

2. **No CVA anywhere** — despite being in the declared stack. All button/input/card variants are purely inline `style={{}}` objects or bare `className` strings. There is no type-safe variant system, no single source of truth for component states.

3. **Framer Motion listed but absent** — zero `import { motion }` or `AnimatePresence` calls in the codebase. All animation is CSS keyframes + inline transitions.

4. **Mixed spacing approach** — `designTokens.ts` defines a clean scale, but components mix three systems: Tailwind spacing utilities (`px-3`, `gap-2`), CSS var references, and raw pixel values in `style={{}}`.

5. **Typography has no heading component** — no `<Heading>`, no `.h1`/`.h2` utility classes. All text sizing is contextual and repeated per-component.

6. **FlashSale is a design island** — uses a completely separate dark-gradient palette with hardcoded values (`#1E1C1A`, `rgba(255,255,255,0.07)`, `#FF3D3D`, `#FFD700`) that don't reference any design tokens. Its add-to-cart button is also 30px (WCAG violation).

7. **Two input component patterns** — SearchBar and LoginSheet Field are unrelated components with different radius, border, bg, and font tokens. No shared `<Input>` primitive.

8. **Radius token bypass** — 14px, 18px, 20px, and 24px appear frequently as hardcoded inline values; these should map to `--radius-md`, `--radius-card`, `--radius-lg`, and an unmapped `--radius-xl` (doesn't exist yet).

9. **Motion has 10+ duration values** — no motion token system. Future animations have no reference point for "fast/medium/slow".

10. **`dir="rtl"` is not set globally** — applied per-component. Risk of missing it in new components.
