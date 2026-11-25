import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createEvaluation, createInstructor, getDashboardData, listInstructors, resetActivePeriod } from "./db";
import { clearOperatorSession, isOperatorRequest, setOperatorSession, verifyOperatorPassword } from "./operatorAuth";
import { operatorProcedure, publicProcedure, router } from "./_core/trpc";

const ratingDistribution = (ratings: number[]) => [1, 2, 3, 4, 5].map(rating => ({ rating, count: ratings.filter(value => value === rating).length }));
const criteria = ["presentationPersonal", "teachingExperience", "respectfulAttention", "explanationClarity", "punctualitySafety"] as const;
const evaluationInput = z.object({
  instructorId: z.number().int().positive(), rating: z.number().int().min(1).max(5),
  presentationPersonal: z.number().int().min(1).max(5), teachingExperience: z.number().int().min(1).max(5),
  respectfulAttention: z.number().int().min(1).max(5), explanationClarity: z.number().int().min(1).max(5),
  punctualitySafety: z.number().int().min(1).max(5), feedback: z.string().max(1200).optional(), photoData: z.string().max(4500000).optional(),
});

export const appRouter = router({
  system: router({ health: publicProcedure.query(() => ({ status: "ok" as const })) }),
  auth: router({ me: publicProcedure.query(opts => opts.ctx.user), logout: publicProcedure.mutation(({ ctx }) => ({ success: Boolean(ctx.user) })) }),
  evaluation: router({ instructors: publicProcedure.query(() => listInstructors()), submit: publicProcedure.input(evaluationInput).mutation(({ input }) => createEvaluation(input)) }),
  operator: router({
    login: publicProcedure.input(z.object({ password: z.string().min(1).max(200) })).mutation(({ input, ctx }) => {
      if (!verifyOperatorPassword(input.password)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Contraseña incorrecta" });
      setOperatorSession(ctx.req, ctx.res); return { success: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => { clearOperatorSession(ctx.req, ctx.res); return { success: true } as const; }),
    me: publicProcedure.query(({ ctx }) => ({ authenticated: isOperatorRequest(ctx.req) })),
    addInstructor: operatorProcedure.input(z.object({ name: z.string().trim().min(2).max(120), category: z.string().trim().min(2).max(20), specialty: z.string().trim().max(160).default("Instructor CEA Cantor") })).mutation(({ input }) => createInstructor(input.name, input.specialty, input.category)),
    resetPeriod: operatorProcedure.mutation(() => resetActivePeriod()),
    dashboard: operatorProcedure.query(async () => {
      const { activePeriod, instructors, evaluations, history } = await getDashboardData();
      const totalEvaluations = evaluations.length;
      const allRatings = evaluations.map(item => item.rating);
      const overallAverage = totalEvaluations ? allRatings.reduce((sum, rating) => sum + rating, 0) / totalEvaluations : 0;
      const averages = Object.fromEntries(criteria.map(key => [key, totalEvaluations ? evaluations.reduce((sum, item) => sum + item[key], 0) / totalEvaluations : 0]));
      const instructorStats = instructors.map(instructor => {
        const items = evaluations.filter(item => item.instructorId === instructor.id);
        const ratings = items.map(item => item.rating);
        return { id: instructor.id, name: instructor.name, category: instructor.category, specialty: instructor.specialty, total: items.length, average: items.length ? ratings.reduce((sum, rating) => sum + rating, 0) / items.length : 0, distribution: ratingDistribution(ratings) };
      });
      const instructorMap = new Map(instructors.map(item => [item.id, item.name]));
      const recentReports = evaluations.filter(item => Boolean(item.feedback?.trim()) || Boolean(item.photoData)).slice(0, 12).map(item => ({ id: item.id, instructorName: instructorMap.get(item.instructorId) ?? "Instructor", rating: item.rating, feedback: item.feedback ?? "", photoData: item.photoData ?? null, createdAt: item.createdAt, criteria: Object.fromEntries(criteria.map(key => [key, item[key]])) }));
      return { activePeriod, history, totalEvaluations, overallAverage: Number(overallAverage.toFixed(1)), criteriaAverages: Object.fromEntries(Object.entries(averages).map(([key, value]) => [key, Number(Number(value).toFixed(1))])), distribution: ratingDistribution(allRatings), instructorStats, recentReports };
    }),
  }),
});
export type AppRouter = typeof appRouter;
