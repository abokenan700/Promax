# Project Map — Phase 0
Generated: 2026-05-13

---

## Structure Map

### Full Folder Tree

```
workspace/
├── artifacts/
│   ├── api-server/                      ← Express.js + TypeScript backend
│   │   ├── src/
│   │   │   ├── app.ts                   ← Express app setup, CORS, versioning
│   │   │   ├── index.ts                 ← Server entry, PORT binding
│   │   │   ├── lib/
│   │   │   │   └── logger.ts            ← Pino logger
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.ts              ← JWT verify middleware
│   │   │   │   ├── device-id.ts         ← x-device-id header extractor
│   │   │   │   ├── error-handler.ts     ← Global error handler
│   │   │   │   └── rate-limit.ts        ← Auth routes rate limiter
│   │   │   └── routes/
│   │   │       ├── index.ts             ← Router aggregator
│   │   │       ├── auth.ts              ← /auth/register, /auth/login, /auth/me
│   │   │       ├── brands.ts            ← GET /brands
│   │   │       ├── cart.ts              ← GET/POST/PUT/DELETE /cart
│   │   │       ├── categories.ts        ← GET /categories
│   │   │       ├── health.ts            ← GET /healthz
│   │   │       ├── products.ts          ← GET /products, GET /products/:id
│   │   │       └── wishlist.ts          ← GET/POST/DELETE /wishlist/:productId
│   │   ├── build.mjs
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mockup-sandbox/                  ← Vite component preview server (dev only)
│   │   └── src/
│   │       ├── components/
│   │       │   ├── mockups/ring/        ← V1.tsx, V2.tsx, V3.tsx
│   │       │   └── ui/                  ← Full shadcn/ui primitive set
│   │       └── ...
│   │
│   └── vibe-app/                        ← React 18 + Vite frontend (mobile-first PWA)
│       ├── index.html                   ← lang="ar" dir="rtl", Tajawal font, PWA meta
│       ├── vite.config.ts               ← PORT/BASE_PATH env, Tailwind v4, aliases
│       ├── public/
│       │   ├── favicon.svg
│       │   ├── logo-*.png
│       │   ├── manifest.json
│       │   └── ...
│       └── src/
│           ├── main.tsx                 ← Providers tree, QueryClient, Router
│           ├── App.tsx                  ← Route definitions, HomePage layout
│           ├── index.css                ← Design tokens (@theme + :root), animations
│           ├── components/              ← 19 components (see inventory)
│           ├── pages/                   ← 11 pages (see inventory)
│           ├── context/
│           │   ├── AuthContext.tsx      ← JWT auth, localStorage
│           │   ├── CartContext.tsx      ← Cart state + fire-and-forget API sync
│           │   └── WishlistContext.tsx  ← Wishlist state + fire-and-forget API sync
│           ├── hooks/
│           │   ├── useCartButton.ts     ← Add-to-cart UI state
│           │   ├── useCategories.ts     ← TanStack Query fetch + static fallback
│           │   └── useCountdown.ts      ← Flash sale countdown timer
│           ├── data/
│           │   └── catalog.ts           ← Static L1/L2/L3 category tree, IMG registry
│           └── lib/
│               ├── colorMap.ts          ← Arabic color name → CSS hex
│               ├── designTokens.ts      ← JS constants mirroring CSS vars (docs only)
│               ├── deviceId.ts          ← UUID generator (localStorage)
│               ├── queryKeys.ts         ← TanStack Query key factory
│               └── utils.ts             ← cn() (clsx + tailwind-merge)
│
├── lib/
│   ├── api-client-react/               ← Orval-generated React Query client
│   │   └── src/
│   │       ├── custom-fetch.ts         ← Fetch wrapper (ApiError, auth token support)
│   │       ├── generated/
│   │       │   ├── api.ts              ← Generated hooks (getProducts, getBrands)
│   │       │   └── api.schemas.ts      ← Generated TypeScript types
│   │       └── index.ts
│   ├── api-spec/
│   │   ├── openapi.yaml                ← OpenAPI 3.1 spec (health, products, brands ONLY)
│   │   └── orval.config.ts             ← Code generation config
│   ├── api-zod/                        ← Zod validators generated from OpenAPI
│   │   └── src/generated/
│   │       ├── api.ts
│   │       └── types/                  ← apiError, brand, healthStatus, product
│   └── db/
│       └── src/
│           ├── index.ts                ← Drizzle db instance
│           └── schema/
│               ├── brands.ts           ← brands(id:text, label, icon)
│               ├── cart.ts             ← cart_items(id, device_id, product_id, qty, color)
│               ├── categories.ts       ← categories(id, slug, name, image_url)
│               ├── products.ts         ← products(id, name, brand, price, ...)
│               ├── users.ts            ← users(id, name, email, password_hash, created_at)
│               └── wishlist.ts         ← wishlist_items(id, device_id, product_id)
│
├── scripts/                            ← post-merge.sh, upload-categories.mjs
├── package.json                        ← Monorepo root
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

### Feature Area Map

| Area | Files | Description |
|------|-------|-------------|
| Auth | AuthContext.tsx, LoginSheet.tsx, routes/auth.ts, middlewares/auth.ts | JWT login/register, 30-day token |
| Catalog Browse | HomePage, Categories, BannerSlider, FlashSale, TrendingSection, CollectionBanners, NewArrivals, FeaturedProducts, Products, Brands | الرئيسية — عرض المنتجات |
| Search | SearchPage (760L), SearchBar | فلترة بالاسم/الماركة/السعر + pagination |
| Product Detail | ProductDetailPage (614L), FeaturedCard | تفاصيل المنتج + ألوان + سلة |
| Cart | CartPage, CartContext, CartButton, useCartButton, routes/cart | سلة المشتريات |
| Wishlist | WishlistPage, WishlistContext, routes/wishlist | المفضلة |
| Checkout | CheckoutPage, OrderSuccessPage | الدفع (UI فقط، بدون بوابة دفع) |
| Orders | OrdersPage | سجل الطلبات |
| Account | AccountPage | بيانات المستخدم |
| Navigation | BottomNav, Header | شريط التنقل السفلي + الهيدر |
| Categories | CategoriesPage, data/catalog.ts | صفحة التصنيفات الكاملة |
| Notifications | NotificationsPage | الإشعارات |

### Inter-Package Dependency Map

```
artifacts/vibe-app
  → @workspace/api-client-react  (generated React Query hooks + types)
  → lucide-react, framer-motion, embla-carousel-react
  → @tanstack/react-query, react-hook-form, zod
  → sonner, wouter, tailwindcss

artifacts/api-server
  → @workspace/db                (Drizzle ORM + schema)
  → @workspace/api-zod           (request validation)
  → express, bcryptjs, jsonwebtoken, pino, cors

lib/api-client-react
  → lib/api-spec                 (openapi.yaml → code generation via orval)

lib/api-zod
  → lib/api-spec                 (openapi.yaml → zod validators via orval)

lib/db
  → drizzle-orm, pg (PostgreSQL)
```

---

## Route Tree

| Path | Component | Protected | Issues |
|------|-----------|-----------|--------|
| `/` | HomePage (inline) | No | — |
| `/categories` | CategoriesPage | No | — |
| `/cart` | CartPage | No | عربة بدون تسجيل — مقبول (device_id) |
| `/wishlist` | WishlistPage | No | مفضلة بدون تسجيل — مقبول (device_id) |
| `/account` | AccountPage | UI-only | لا يوجد route guard — UI تتحقق فقط |
| `/search` | SearchPage | No | — |
| `/product/:id` | ProductDetailPage | No | — |
| `/checkout` | CheckoutPage | UI-only | **HIGH** لا يوجد route guard |
| `/order/success` | OrderSuccessPage | No | يمكن الوصول مباشرة بدون طلب |
| `/orders` | OrdersPage | UI-only | **HIGH** لا يوجد route guard |
| `/notifications` | NotificationsPage | No | — |
| `*` | NotFoundPage | No | موجود ✅ |

**ملاحظة:** لا يوجد استخدام لـ `window.location` — Wouter يُستخدم بشكل صحيح. لا توجد مسارات مكررة.

---

## Component Inventory

### Components (19)

| Name | Path | Type | Lines | Notes |
|------|------|------|-------|-------|
| BannerSlider | components/BannerSlider.tsx | Feature | 156 | Embla carousel |
| BottomNav | components/BottomNav.tsx | Layout | 140 | 5 nav items + active state |
| Brands | components/Brands.tsx | Feature | 79 | Horizontal scroll, API fetch |
| CartButton | components/CartButton.tsx | Shared | 57 | Reusable add-to-cart button |
| Categories | components/Categories.tsx | Feature | 102 | useCategories hook, horizontal scroll |
| CollectionBanners | components/CollectionBanners.tsx | Feature | 80 | Static collection cards |
| DealCard | components/DealCard.tsx | Shared | 86 | Reusable deal card |
| ErrorBoundary | components/ErrorBoundary.tsx | Shared | 96 | Class component, fallback UI |
| FeaturedCard | components/FeaturedCard.tsx | Shared | 187 | Product card with color picker |
| FeaturedProducts | components/FeaturedProducts.tsx | Feature | 42 | Grid wrapper |
| Features | components/Features.tsx | Feature | 46 | Daily deals strip |
| FlashSale | components/FlashSale.tsx | Feature | 119 | Countdown + product carousel |
| Header | components/Header.tsx | Layout | 68 | Logo + cart + wishlist icons |
| LoginSheet | components/LoginSheet.tsx | Feature | 226 | Bottom sheet auth (login/register) |
| NewArrivals | components/NewArrivals.tsx | Feature | 118 | New products section |
| Products | components/Products.tsx | Feature | 80 | Products grid |
| SearchBar | components/SearchBar.tsx | Shared | 119 | Read-only (nav) + interactive (search page) |
| SectionHeader | components/SectionHeader.tsx | Shared | 44 | Title + "view all" link |
| TrendingSection | components/TrendingSection.tsx | Feature | 94 | Trending products |

### Pages (11)

| Name | Path | Lines | Notes |
|------|------|-------|-------|
| AccountPage | pages/AccountPage.tsx | 210 | User profile, orders link |
| CartPage | pages/CartPage.tsx | 330 | Cart items, totals, checkout button |
| CategoriesPage | pages/CategoriesPage.tsx | 317 | L1/L2/L3 category tree |
| CheckoutPage | pages/CheckoutPage.tsx | 247 | Address form, order summary |
| NotFoundPage | pages/not-found.tsx | 95 | 404 fallback |
| NotificationsPage | pages/NotificationsPage.tsx | 120 | Static notifications list |
| OrdersPage | pages/OrdersPage.tsx | 189 | Orders history |
| OrderSuccessPage | pages/OrderSuccessPage.tsx | 122 | Post-order confirmation |
| ProductDetailPage | pages/ProductDetailPage.tsx | 614 | **MEDIUM** — ملف كبير جداً |
| SearchPage | pages/SearchPage.tsx | 760 | **MEDIUM** — أكبر ملف في التطبيق |
| WishlistPage | pages/WishlistPage.tsx | 210 | Wishlist grid |

**اكتشاف:** لا توجد مكونات مكررة بشكل صريح. FeaturedCard هو أغنى مكون مشترك (187 سطر).

---

## Hooks & State Map

| Name | Type | Consumers | Issues |
|------|------|-----------|--------|
| useAuth | Context hook | AccountPage, LoginSheet, Header, CartPage, CheckoutPage, OrdersPage | JWT في localStorage (XSS risk) |
| useCart | Context hook | CartPage, CartButton, useCartButton, CheckoutPage | fire-and-forget API sync فقط |
| useWishlist | Context hook | WishlistPage, FeaturedCard, ProductDetailPage | fire-and-forget API sync فقط |
| useCategories | Query hook | Categories component | يستخدم queryKeys.categories() بشكل صحيح |
| useCartButton | Custom hook | CartButton, FeaturedCard, ProductDetailPage | يُغلّف useCart.addToCart |
| useCountdown | Custom hook | FlashSale | countdown ثابت لا يعرف وقت انتهاء العرض الحقيقي |

**ملاحظة prop drilling:** لا يوجد prop drilling واضح — Contexts تُستخدم بشكل صحيح في كل مكان.

**TanStack Query Usage:**
- `useCategories` → queryKeys.categories() ✅
- `lib/api-client-react` → getProducts, getBrands (generated hooks) ✅
- Cart و Wishlist → **لا يستخدمان TanStack Query** (raw fetch في Context) ⚠️

---

## Design Token Inventory

### Colors

| Token | Light | Dark | Location |
|-------|-------|------|----------|
| --gold | #C0A882 | #C9A870 | :root + @theme |
| --gold-dark | #9a6e00 | #A07830 | :root + @theme |
| --gold-mid | #c9a84c | #D4AF50 | :root + @theme |
| --gold-light | #F5E8D4 | #2E2318 | :root + @theme |
| --gold-pale | #fdf6ec | #241C10 | :root + @theme |
| --gold-accent | #B8922A | #D4A040 | :root + @theme |
| --gold-warm | #D4AF37 | #D4AF37 | :root + @theme |
| --text-primary | #2E2C2A | #F0EBE3 | :root + @theme |
| --text-secondary | #5A5856 | #B0A498 | :root + @theme |
| --text-muted | #767676 | #807870 | :root + @theme |
| --text-price | #1E1C1A | #FFFFFF | :root + @theme |
| --text-brand | #8B6310 | #C9A84C | :root + @theme |
| --bg-page | #F3F2F1 | #1A1714 | :root + @theme |
| --bg-card | #FFFFFF | #242018 | :root + @theme |
| --success | #5A8A4A | #6AAF5A | :root + @theme |
| --error | #E04545 | #FF6060 | :root + @theme |

### Typography Scale (Clamp-based, Responsive)

| Token | Light Viewport | Max |
|-------|---------------|-----|
| --text-2xs | clamp(8.5px, 2.3vw, 10px) | 10px |
| --text-xs | clamp(10px, 2.8vw, 12px) | 12px |
| --text-sm | clamp(11px, 3vw, 13px) | 13px |
| --text-base | clamp(13px, 3.6vw, 15px) | 15px |
| --text-lg | clamp(14px, 4vw, 17px) | 17px |
| --text-xl | clamp(18px, 5.5vw, 22px) | 22px |
| --text-price-lg | clamp(24px, 7vw, 28px) | 28px |

Font weights in designTokens.ts: 400, 500, 600, 700, 800, 900 (Tajawal supports all).

### Border Radius

| Token | Value |
|-------|-------|
| --radius-sm | 0.5rem (8px) |
| --radius-md | 0.875rem (14px) |
| --radius-lg | 1.25rem (20px) |
| --radius-card | 1rem (16px) |

### Shadows

| Token | Value |
|-------|-------|
| --shadow-sm | 0 1px 3px rgba(0,0,0,0.04) |
| --shadow-md | 0 3px 8px rgba(192,168,130,0.38) |
| --shadow-lg | 0 0 80px rgba(0,0,0,0.20) |
| --shadow-sheet | 0 -4px 40px rgba(0,0,0,0.12) |
| --shadow-feature | 0 1px 6px ... |
| --shadow-success | 0 2px 8px rgba(90,160,90,0.32) |
| --shadow-glow | 0 0 8px rgba(180,120,0,0.45) |

### Other

| Token | Value |
|-------|-------|
| --nav-h | 68px |
| --font-main | 'Tajawal', sans-serif |
| max-width | 430px (app-shell) |

### Flags

| Flag | Severity | Detail |
|------|----------|--------|
| Token duplication: @theme + :root | MEDIUM | كل رمز لوني مُعرَّف مرتين — مقصود لتوافق Tailwind v4 + CSS vars لكنه خطر صيانة |
| @assets alias → مسار محذوف | HIGH | vite.config.ts يُشير إلى attached_assets/ المحذوف — لا يُستخدم حالياً لكن قد يكسر البناء |
| "/api/v1" hardcoded في 4 ملفات | MEDIUM | AuthContext, CartContext, WishlistContext, useCategories.ts |
| Countdown ثابت | LOW | useCountdown يبدأ بقيم ثابتة {h:2,m:30,s:0} بدون مصدر حقيقي |

---

## RTL Foundation

| Check | Result | Detail |
|-------|--------|--------|
| `dir="rtl"` على `<html>` | ✅ Pass | index.html: `<html lang="ar" dir="rtl">` |
| تحميل خط عربي | ✅ Pass | Tajawal 400-900 من Google Fonts |
| CSS vars RTL-aware | ✅ Pass | يستخدم `inset-inline`, `inset-inline-start` |
| Toaster direction | ✅ Pass | `direction: "rtl"` في Toaster options |
| Skip link RTL | ✅ Pass | يستخدم `inset-inline-start: 50%` |
| Dark mode | ✅ Pass | كامل عبر `@media (prefers-color-scheme: dark)` |
| Embla Carousel RTL | ⚠️ Unverified | لم يُقرأ إعداد `direction` داخل BannerSlider |
| OTP Input direction | ✅ N/A | لا يوجد OTP في vibe-app (موجود فقط في mockup-sandbox) |
| Reduced motion | ✅ Pass | `@media (prefers-reduced-motion: reduce)` موجود |

---

## API & Query Map

### TanStack Query Keys

| Key Factory | Output | Used In | Issues |
|------------|--------|---------|--------|
| queryKeys.products() | ["products"] | api-client-react (generated) | — |
| queryKeys.product(id) | ["product", id] | غير مستخدم حالياً في queries | مُعرَّف لكن لا hook يستدعيه |
| queryKeys.brands() | ["brands"] | api-client-react (generated) | — |
| queryKeys.categories() | ["categories"] | useCategories | — |

### API Routes Map (Server)

| Method | Path | Auth | Rate Limit | DB Tables |
|--------|------|------|-----------|-----------|
| GET | /api/v1/healthz | No | No | — |
| GET | /api/v1/products | No | No | products |
| GET | /api/v1/products/:id | No | No | products |
| GET | /api/v1/brands | No | No | brands |
| GET | /api/v1/categories | No | No | categories |
| GET | /api/v1/cart | device_id | No | cart_items + products |
| POST | /api/v1/cart | device_id | No | cart_items |
| PUT | /api/v1/cart/:id | device_id | No | cart_items |
| DELETE | /api/v1/cart/product/:id | device_id | No | cart_items |
| DELETE | /api/v1/cart/:id | device_id | No | cart_items |
| DELETE | /api/v1/cart | device_id | No | cart_items |
| GET | /api/v1/wishlist | device_id | No | wishlist_items + products |
| POST | /api/v1/wishlist/:id | device_id | No | wishlist_items |
| DELETE | /api/v1/wishlist/:id | device_id | No | wishlist_items |
| POST | /api/v1/auth/register | No | ✅ Yes | users |
| POST | /api/v1/auth/login | No | ✅ Yes | users |
| GET | /api/v1/auth/me | JWT Bearer | No | users |

### Issues

| ID | Area | Description | Severity |
|----|------|-------------|----------|
| I-01 | Build | @assets alias في vite.config.ts يُشير إلى مجلد attached_assets/ المحذوف | HIGH |
| I-02 | API Spec | openapi.yaml يغطي 3 endpoints فقط من 15 — cart/wishlist/auth/categories غائبة | HIGH |
| I-03 | Security | لا يوجد route guard على /checkout و/orders و/account — حماية UI فقط | HIGH |
| I-04 | Security | JWT مخزون في localStorage (عرضة لـ XSS في بيئة الإنتاج) | HIGH |
| I-05 | Consistency | "/api/v1" مكرر كـ string في 4 ملفات (AuthContext, CartContext, WishlistContext, useCategories) | MEDIUM |
| I-06 | Tokens | CSS design tokens مُعرَّفة مرتين (@theme + :root) — خطر صيانة | MEDIUM |
| I-07 | Data Sync | سلة المشتريات تعتمد localStorage-primary؛ API sync fire-and-forget — لا مزامنة متعددة الأجهزة | MEDIUM |
| I-08 | Architecture | Cart و Wishlist لا يستخدمان TanStack Query — لا loading/error states من cache | MEDIUM |
| I-09 | Size | ProductDetailPage.tsx (614 سطر) — يحتاج تجزئة | MEDIUM |
| I-10 | Size | SearchPage.tsx (760 سطر) — أكبر ملف في التطبيق | MEDIUM |
| I-11 | Data | queryKeys.product(id) مُعرَّف في queryKeys.ts لكن لا hook يستخدمه | LOW |
| I-12 | FlashSale | useCountdown يبدأ بقيم ثابتة {h:2,m:30,s:0} بدون نهاية حقيقية | LOW |
| I-13 | Carousel | إعداد RTL في embla-carousel (BannerSlider) لم يُتحقق منه | LOW |

**الإجمالي: 13 مشكلة — 4 HIGH، 5 MEDIUM، 4 LOW**
