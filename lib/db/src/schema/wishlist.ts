import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const wishlistItemsTable = pgTable("wishlist_items", {
  id:         serial("id").primaryKey(),
  device_id:  text("device_id").notNull(),
  product_id: integer("product_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
}, (t) => [unique("wishlist_unique_item").on(t.device_id, t.product_id)]);

export type WishlistItem    = typeof wishlistItemsTable.$inferSelect;
export type InsertWishlistItem = typeof wishlistItemsTable.$inferInsert;
