import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in", { withTimezone: true }).defaultNow().notNull(),
});

export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  category: varchar("category", { length: 20 }).notNull().default("A2"),
  specialty: varchar("specialty", { length: 160 }).notNull().default("Instructor CEA Cantor"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const evaluationPeriods = pgTable("evaluation_periods", {
  id: serial("id").primaryKey(),
  periodKey: varchar("period_key", { length: 80 }).notNull().unique(),
  calendarKey: varchar("calendar_key", { length: 20 }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
});

export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  instructorId: integer("instructor_id").notNull(),
  periodKey: varchar("period_key", { length: 80 }).notNull(),
  rating: integer("rating").notNull(),
  presentationPersonal: integer("presentation_personal").notNull(),
  teachingExperience: integer("teaching_experience").notNull(),
  respectfulAttention: integer("respectful_attention").notNull(),
  explanationClarity: integer("explanation_clarity").notNull(),
  punctualitySafety: integer("punctuality_safety").notNull(),
  feedback: text("feedback"),
  photoData: text("photo_data"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Instructor = typeof instructors.$inferSelect;
export type Evaluation = typeof evaluations.$inferSelect;
export type EvaluationPeriod = typeof evaluationPeriods.$inferSelect;
