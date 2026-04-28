import { pgTable, text, timestamp, pgEnum, integer, real } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const roleEnum = pgEnum("role", ["citizen", "staff", "admin"]);
export const statusEnum = pgEnum("status", [
  "open",
  "in_progress",
  "resolved",
  "closed",
]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const departments = pgTable("departments", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  emailAlias: text("email_alias").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  departmentId: text("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "restrict" }),
  slaHours: integer("sla_hours").notNull().default(72),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk userId
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("citizen"),
  departmentId: text("department_id").references(() => departments.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const serviceRequests = pgTable("service_requests", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  citizenEmail: text("citizen_email"),
  citizenName: text("citizen_name").notNull(),
  citizenId: text("citizen_id"), // optional, null for guest submissions
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  departmentId: text("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  photoUrl: text("photo_url"),
  status: statusEnum("status").notNull().default("open"),
  priority: priorityEnum("priority").notNull().default("medium"),
  assignedTo: text("assigned_to").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const statusHistory = pgTable("status_history", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  requestId: text("request_id")
    .notNull()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  oldStatus: statusEnum("old_status"),
  newStatus: statusEnum("new_status").notNull(),
  changedBy: text("changed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Department = typeof departments.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type User = typeof users.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type StatusHistory = typeof statusHistory.$inferSelect;
export type Status = "open" | "in_progress" | "resolved" | "closed";
export type Role = "citizen" | "staff" | "admin";
