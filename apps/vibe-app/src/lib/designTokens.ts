/**
 * THAWQ Visual Identity — Applied to نخبة
 * Palette: #A67C52 · #D4B99A · #F6F2EE · #1A1A1A · #FFFFFF
 * Accent:  #B85C00 (urgency — discounts, flash, notifications)
 *
 * استخدم CSS vars في style={{}} بدلاً من القيم المباشرة:
 *   var(--gold), var(--text-brand), var(--accent) ... إلخ
 */

export const BRAND = {
  gold:          "var(--gold)",              /* #A67C52 — THAWQ primary brown */
  goldDark:      "var(--gold-dark)",         /* #6B4A00 */
  goldAccent:    "var(--gold-accent)",       /* #8B5E38 */
  goldLight:     "var(--gold-light)",        /* #EDE0D0 */
  goldMid:       "var(--gold-mid)",          /* #C09060 */
  gradientGold:  "var(--gradient-gold)",
  gradientText:  "var(--gradient-brand-text)",
  gradientCta:   "var(--gradient-cta)",
} as const;

export const ACCENT = {
  main:    "var(--accent)",       /* #B85C00 — urgency / discount / alert */
  bg:      "var(--accent-bg)",    /* #FEF0E6 */
  light:   "var(--accent-light)", /* #FFF8F2 */
  text:    "var(--accent-text)",  /* #B85C00 */
} as const;

export const TEXT = {
  primary:   "var(--text-primary)",   /* #1A1A1A */
  secondary: "var(--text-secondary)", /* #5A5856 */
  muted:     "var(--text-muted)",     /* #8A8480 */
  price:     "var(--text-price)",     /* #1A1A1A */
  brand:     "var(--text-brand)",     /* #7A5A38 */
} as const;

export const SURFACE = {
  page:    "var(--bg-page)",           /* #F6F2EE — THAWQ cream */
  card:    "var(--bg-card)",           /* #FFFFFF */
  warm:    "var(--bg-surface-warm)",   /* #F8F3EE */
  subtle:  "var(--bg-surface-subtle)", /* #F5F0E9 */
  ctaDark: "var(--bg-cta-dark)",       /* #1A1A1A */
} as const;

export const RADIUS = {
  sm:   "var(--radius-sm)",    /* 8px  */
  md:   "var(--radius-md)",    /* 14px */
  lg:   "var(--radius-lg)",    /* 20px */
  card: "var(--radius-card)",  /* 16px */
  xl:   "var(--radius-xl)",    /* 24px */
  full: 9999,
} as const;

export const ICON_SIZE = {
  xs:  12,
  sm:  16,
  md:  20,
  lg:  24,
  xl:  28,
  xxl: 36,
} as const;

export const FONT_SIZE = {
  "2xs": "var(--text-2xs)",  /* clamp(8.5px, 2.3vw, 10px) */
  xs:    "var(--text-xs)",   /* clamp(10px,  2.8vw, 12px) */
  sm:    "var(--text-sm)",   /* clamp(11px,  3vw,   13px) */
  base:  "var(--text-base)", /* clamp(13px,  3.6vw, 15px) */
  lg:    "var(--text-lg)",   /* clamp(14px,  4vw,   17px) */
  xl:    "var(--text-xl)",   /* clamp(18px,  5.5vw, 22px) */
  priceLg: "var(--text-price-lg)", /* clamp(24px, 7vw, 28px) */
} as const;

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
} as const;

export const WEIGHT = {
  regular:   400,
  medium:    500,
  semibold:  600,
  bold:      700,
  extrabold: 800,
  black:     900,
} as const;

/** Motion — 3 canonical speeds */
export const MOTION = {
  fast:   "var(--duration-fast)",  /* 0.15s */
  base:   "var(--duration-base)",  /* 0.28s */
  slow:   "var(--duration-slow)",  /* 0.50s */
  easeOut:    "var(--ease-out)",
  easeSpring: "var(--ease-spring)",
  easeSlide:  "var(--ease-slide)",
} as const;
