import { pgTable, serial, text, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";

export const reviewsTable = pgTable("reviews", {
  id:         serial("id").primaryKey(),
  product_id: integer("product_id").notNull(),
  user_id:    integer("user_id").notNull(),
  user_name:  text("user_name").notNull(),
  rating:     doublePrecision("rating").notNull(),
  body:       text("body").notNull(),
  verified:   integer("verified").notNull().default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export type Review       = typeof reviewsTable.$inferSelect;
export type InsertReview = typeof reviewsTable.$inferInsert;
