import { pgTable, serial, text, integer, doublePrecision, boolean } from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id:             serial("id").primaryKey(),
  name:           text("name").notNull(),
  brand:          text("brand").notNull(),
  price:          doublePrecision("price").notNull(),
  original_price: doublePrecision("original_price").notNull(),
  discount:       integer("discount").notNull(),
  image:          text("image").notNull(),
  images:         text("images").array().notNull().default([]),
  description:    text("description").notNull().default(""),
  is_new:         boolean("is_new").default(false),
  rating:         doublePrecision("rating").notNull(),
  sales:          integer("sales").notNull().default(0),
  stock:          integer("stock").notNull().default(100),
  colors:         text("colors").array().notNull().default([]),
  sizes:          text("sizes").array().notNull().default([]),
});

export type InsertProduct = typeof productsTable.$inferInsert;
export type Product = typeof productsTable.$inferSelect;
