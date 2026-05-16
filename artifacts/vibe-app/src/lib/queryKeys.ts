/**
 * مشكلة 108: query key factory مركزي
 * بدلاً من strings مبثوثة في كل مكان، نستخدم factory functions
 * تُسهّل cache invalidation وتمنع typos في القيم
 */

export const queryKeys = {
  /** جميع المنتجات */
  products: () => ["products"] as const,

  /** منتج واحد بـ id */
  product: (id: number) => ["product", id] as const,

  /** جميع الماركات */
  brands: () => ["brands"] as const,

  /** قائمة الفئات */
  categories: () => ["categories"] as const,
} as const;
