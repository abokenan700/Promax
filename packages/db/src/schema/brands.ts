import { pgTable, text } from "drizzle-orm/pg-core";

/*
 * مشكلة 151: brands.id كان نوعه text بينما products.id نوعه serial (auto-increment integer)
 * التناقض يصعّب JOIN queries والمقارنات — أبقينا text لأن brand IDs نصية بطبيعتها
 * (مثل "gucci", "louis_vuitton") وهذا مقصود — لكن نُوثّق القرار صراحةً:
 *
 * brands.id = text (slug مقروء من البشر، e.g. "rolex") — INTENTIONAL
 * products.id = serial (رقم تلقائي لأن المنتجات تُضاف برمجياً) — INTENTIONAL
 *
 * القاعدة: لا حاجة لتغيير النوع — التصميم صحيح لكنه كان غير موثَّق
 */
export const brandsTable = pgTable("brands", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  icon: text("icon"),
});

export type InsertBrand = typeof brandsTable.$inferInsert;
export type Brand = typeof brandsTable.$inferSelect;
