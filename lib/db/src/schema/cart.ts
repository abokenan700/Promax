import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const cartItemsTable = pgTable("cart_items", {
  id:         serial("id").primaryKey(),
  device_id:  text("device_id").notNull(),
  product_id: integer("product_id").notNull(),
  qty:        integer("qty").notNull().default(1),
  color:      text("color").notNull().default(""),
  updated_at: timestamp("updated_at").defaultNow(),
}, (t) => [unique("cart_unique_item").on(t.device_id, t.product_id, t.color)]);

export type CartItem    = typeof cartItemsTable.$inferSelect;
export type InsertCartItem = typeof cartItemsTable.$inferInsert;
