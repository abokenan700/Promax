import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  id:               serial("id").primaryKey(),
  user_id:          integer("user_id").notNull(),
  status:           text("status").notNull().default("processing"),
  payment_method:   text("payment_method").notNull().default("cod"),
  address_name:     text("address_name"),
  address_phone:    text("address_phone"),
  address_city:     text("address_city"),
  address_district: text("address_district"),
  address_street:   text("address_street"),
  subtotal:         numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping:         numeric("shipping",  { precision: 10, scale: 2 }).notNull().default("25"),
  total:            numeric("total",     { precision: 10, scale: 2 }).notNull(),
  tracking_number:  text("tracking_number"),
  carrier:          text("carrier"),
  created_at:       timestamp("created_at").defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id:         serial("id").primaryKey(),
  order_id:   integer("order_id").notNull(),
  product_id: integer("product_id").notNull(),
  name:       text("name").notNull(),
  brand:      text("brand").notNull(),
  price:      numeric("price", { precision: 10, scale: 2 }).notNull(),
  qty:        integer("qty").notNull(),
  color:      text("color").notNull().default(""),
  image:      text("image").notNull().default(""),
});

export const notificationsTable = pgTable("notifications", {
  id:         serial("id").primaryKey(),
  user_id:    integer("user_id"),
  device_id:  text("device_id"),
  type:       text("type").notNull().default("promo"),
  title:      text("title").notNull(),
  body:       text("body").notNull(),
  action:     text("action"),
  read:       text("read").notNull().default("false"),
  created_at: timestamp("created_at").defaultNow(),
});

export const priceAlertsTable = pgTable("price_alerts", {
  id:            serial("id").primaryKey(),
  user_id:       integer("user_id").notNull(),
  product_id:    integer("product_id").notNull(),
  product_name:  text("product_name").notNull(),
  product_image: text("product_image").notNull().default(""),
  current_price: numeric("current_price", { precision: 10, scale: 2 }).notNull(),
  target_price:  numeric("target_price",  { precision: 10, scale: 2 }).notNull(),
  created_at:    timestamp("created_at").defaultNow(),
  triggered_at:  timestamp("triggered_at"),
});

export type Order        = typeof ordersTable.$inferSelect;
export type InsertOrder  = typeof ordersTable.$inferInsert;
export type OrderItem    = typeof orderItemsTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
export type PriceAlert   = typeof priceAlertsTable.$inferSelect;
