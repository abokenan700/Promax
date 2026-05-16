import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id:             serial("id").primaryKey(),
  name:           text("name").notNull(),
  email:          text("email").notNull().unique(),
  password_hash:  text("password_hash"),           // null for OAuth-only accounts
  avatar:         text("avatar"),
  points:         integer("points").notNull().default(0),
  reset_otp:      text("reset_otp"),
  reset_otp_exp:  timestamp("reset_otp_exp"),
  oauth_provider: text("oauth_provider"),           // "google" | "facebook" | "x" | "apple"
  oauth_id:       text("oauth_id"),
  created_at:     timestamp("created_at").defaultNow(),
});

export type User       = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
