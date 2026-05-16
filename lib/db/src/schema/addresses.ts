import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const addressesTable = pgTable("addresses", {
  id:         serial("id").primaryKey(),
  user_id:    integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  label:      text("label").notNull().default("المنزل"),
  name:       text("name").notNull(),
  phone:      text("phone").notNull(),
  city:       text("city").notNull(),
  district:   text("district").notNull(),
  street:     text("street").notNull(),
  apartment:  text("apartment"),
  zip:        text("zip"),
  is_default: boolean("is_default").notNull().default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export type Address       = typeof addressesTable.$inferSelect;
export type InsertAddress = typeof addressesTable.$inferInsert;
