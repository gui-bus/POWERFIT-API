import z from "zod";

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const PaginationQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  muscleGroup: z.string(),
  equipment: z.string().nullable(),
  instructions: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  videoUrl: z.string().url().nullable(),
  difficulty: z.string().nullable(),
});

export const WaterLogSchema = z.object({
  id: z.string().uuid(),
  amountInMl: z.number().int().positive(),
  loggedAt: z.string().datetime(),
});

export const LogWaterSchema = z.object({
  amountInMl: z.number().int().positive().describe("Amount of water in milliliters (e.g., 500)"),
});
