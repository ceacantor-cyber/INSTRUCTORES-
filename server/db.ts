import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ENV } from "./_core/env";
import { evaluationPeriods, evaluations, InsertUser, instructors, users, type EvaluationPeriod } from "../drizzle/schema";

let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: Number(process.env.DB_POOL_MAX || 5),
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _pool = null;
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } });
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

const roster = [
  { name: "Joan Rincon", category: "A2", specialty: "Motocicletas · Categoría A2" },
  { name: "Oscar Muñoz", category: "A2", specialty: "Motocicletas · Categoría A2" },
  { name: "Miguel Vargas", category: "A2", specialty: "Motocicletas · Categoría A2" },
  { name: "Jorge Malagon", category: "A2", specialty: "Motocicletas · Categoría A2" },
  { name: "Fabian Martinez", category: "B2-C2", specialty: "Vehículos · Categorías B2 y C2" },
  { name: "Cristian Ortega", category: "B2-C2", specialty: "Vehículos · Categorías B2 y C2" },
  { name: "Cristian Riaño", category: "B2-C2", specialty: "Vehículos · Categorías B2 y C2" },
  { name: "Alexander Gaviria", category: "B2-C2", specialty: "Vehículos · Categorías B2 y C2" },
  { name: "Orlando Callejas", category: "B2-C2", specialty: "Vehículos · Categorías B2 y C2" },
];

export async function listInstructors() {
  const db = await getDb();
  if (!db) return roster.map((item, index) => ({ id: index + 1, ...item, createdAt: new Date() }));
  let rows = await db.select().from(instructors).orderBy(instructors.category, instructors.name);
  const exactNames = new Set(roster.map(item => item.name));
  if (!rows.some(row => exactNames.has(row.name))) {
    const previousEvaluations = await db.select({ id: evaluations.id }).from(evaluations).limit(1);
    if (previousEvaluations.length === 0 && rows.length >= 4) {
      const existing = [...rows].sort((a, b) => a.id - b.id);
      for (let index = 0; index < Math.min(4, existing.length); index += 1) await db.update(instructors).set(roster[index]).where(eq(instructors.id, existing[index].id));
      if (roster.length > 4) await db.insert(instructors).values(roster.slice(4));
    } else if (rows.length === 0) {
      await db.insert(instructors).values(roster);
    }
    rows = await db.select().from(instructors).orderBy(instructors.category, instructors.name);
  }
  return rows;
}

export async function createInstructor(name: string, specialty: string, category: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(instructors).values({ name, category, specialty: specialty || "Instructor CEA Cantor" }).returning();
  return result[0];
}

function currentCalendarKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const year = parts.find(part => part.type === "year")?.value ?? "0000";
  const month = parts.find(part => part.type === "month")?.value ?? "01";
  const day = Number(parts.find(part => part.type === "day")?.value ?? "01");
  return `${year}-${month}-${day <= 15 ? "01" : "16"}`;
}

export async function ensureActivePeriod() {
  const db = await getDb();
  if (!db) return { periodKey: currentCalendarKey(), calendarKey: currentCalendarKey(), isActive: true, startedAt: new Date(), closedAt: null, id: 0 } as EvaluationPeriod;
  const calendarKey = currentCalendarKey();
  const active = await db.select().from(evaluationPeriods).where(eq(evaluationPeriods.isActive, true)).orderBy(desc(evaluationPeriods.startedAt)).limit(1);
  if (active[0] && active[0].calendarKey === calendarKey) return active[0];
  if (active[0]) await db.update(evaluationPeriods).set({ isActive: false, closedAt: new Date() }).where(eq(evaluationPeriods.id, active[0].id));
  const result = await db.insert(evaluationPeriods).values({ periodKey: calendarKey, calendarKey, isActive: true }).onConflictDoNothing({ target: evaluationPeriods.periodKey }).returning();
  if (result[0]) return result[0];
  const existing = await db.select().from(evaluationPeriods).where(eq(evaluationPeriods.periodKey, calendarKey)).limit(1);
  return existing[0];
}

export async function resetActivePeriod() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const active = await ensureActivePeriod();
  await db.update(evaluationPeriods).set({ isActive: false, closedAt: new Date() }).where(eq(evaluationPeriods.id, active.id));
  const calendarKey = currentCalendarKey();
  const periodKey = `${calendarKey}-manual-${Date.now()}`;
  const result = await db.insert(evaluationPeriods).values({ periodKey, calendarKey, isActive: true }).returning();
  return { previousPeriodKey: active.periodKey, period: result[0] };
}

export type EvaluationInput = {
  instructorId: number; rating: number; presentationPersonal: number; teachingExperience: number;
  respectfulAttention: number; explanationClarity: number; punctualitySafety: number;
  feedback?: string; photoData?: string;
};

export async function createEvaluation(input: EvaluationInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const instructor = await db.select({ id: instructors.id }).from(instructors).where(eq(instructors.id, input.instructorId)).limit(1);
  if (instructor.length === 0) throw new Error("Instructor not found");
  const period = await ensureActivePeriod();
  await db.insert(evaluations).values({ ...input, periodKey: period.periodKey, feedback: input.feedback?.trim() || null, photoData: input.photoData || null });
  return { success: true } as const;
}

export async function getPeriodHistory() {
  const db = await getDb();
  if (!db) return [];
  const [periods, allEvaluations] = await Promise.all([
    db.select().from(evaluationPeriods).orderBy(desc(evaluationPeriods.startedAt)),
    db.select().from(evaluations),
  ]);
  return periods.map(period => {
    const items = allEvaluations.filter(item => item.periodKey === period.periodKey);
    const average = items.length ? items.reduce((sum, item) => sum + item.rating, 0) / items.length : 0;
    return { periodKey: period.periodKey, calendarKey: period.calendarKey, startedAt: period.startedAt, closedAt: period.closedAt, isActive: period.isActive, total: items.length, average: Number(average.toFixed(1)) };
  });
}

export async function getDashboardData() {
  const db = await getDb();
  if (!db) return { activePeriod: await ensureActivePeriod(), instructors: [], evaluations: [], history: [] };
  await listInstructors();
  const activePeriod = await ensureActivePeriod();
  const [instructorRows, evaluationRows, history] = await Promise.all([
    db.select().from(instructors).orderBy(instructors.category, instructors.name),
    db.select().from(evaluations).where(eq(evaluations.periodKey, activePeriod.periodKey)).orderBy(desc(evaluations.createdAt)),
    getPeriodHistory(),
  ]);
  return { activePeriod, instructors: instructorRows, evaluations: evaluationRows, history };
}
