TASK PLAN — PHASE 0
─────────────────────────────────────────────────────────────────────
الترتيب: CRITICAL → HIGH → MEDIUM → LOW
كل مهمة مستقلة — لا مهمة تعتمد على لاحقتها
─────────────────────────────────────────────────────────────────────

[T01] ✅ | إصلاح @assets alias المكسور في vite.config.ts
          | الملفات: artifacts/vibe-app/vite.config.ts
          | الخطر: H

[T02] ✅ | إنشاء ثابت مشترك API_BASE بدلاً من تكرار "/api/v1"
          | الملفات: artifacts/vibe-app/src/lib/apiBase.ts (جديد)، AuthContext، CartContext
          | الخطر: L

[T03] ✅ | تطبيق API_BASE في جميع الملفات المتبقية
          | الملفات: WishlistContext، useCategories، SearchPage، ProductDetailPage
          | الخطر: L

[T04] ✅ | إضافة ProtectedRoute لحماية /checkout و/orders و/account
          | الملفات: artifacts/vibe-app/src/App.tsx
          | الخطر: M

[T05] ✅ | توثيق قرار JWT في localStorage + تعليق تحذير في AuthContext
          | الملفات: artifacts/vibe-app/src/context/AuthContext.tsx
          | الخطر: L

[T06] ✅ | إكمال openapi.yaml — auth endpoints (register/login/me)
          | الملفات: lib/api-spec/openapi.yaml
          | الخطر: M

[T07] ✅ | إكمال openapi.yaml — cart endpoints (GET/POST/DELETE)
          | الملفات: lib/api-spec/openapi.yaml
          | الخطر: M

[T08] ✅ | إكمال openapi.yaml — wishlist وcategories + schemas كاملة
          | الملفات: lib/api-spec/openapi.yaml
          | الخطر: L

[T09] ✅ | BannerSlider RTL — لا إصلاح مطلوب (CSS مخصص وليس Embla)
          | الخطر: M

[T10] ✅ | useCountdown يقبل targetMs: number — FlashSale وProducts محدّثان
          | الملفات: hooks/useCountdown.ts، FlashSale.tsx، Products.tsx
          | الخطر: L

[T11] ✅ | استخراج StickyBuyBar.tsx وProductColorPicker.tsx من ProductDetailPage
          | الملفات: components/StickyBuyBar.tsx (جديد)، components/ProductColorPicker.tsx (جديد)
          | الخطر: L

[T12] ✅ | استخراج SearchFilters.tsx (FilterSheet + SortSheet + ControlsBar) من SearchPage
          | الملفات: components/SearchFilters.tsx (جديد)
          | الخطر: L

─────────────────────────────────────────────────────────────────────
Total: 12 مهمة — جميعها مكتملة ✅
─────────────────────────────────────────────────────────────────────
