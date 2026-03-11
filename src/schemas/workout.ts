import z from "zod";

import { WeekDay } from "../generated/prisma/enums.js";

export const WorkoutPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  workoutDays: z.array(
    z.object({
      name: z.string().trim().min(1),
      coverImageUrl: z.string().optional().nullable(),
      weekDay: z.enum(WeekDay),
      isRestDay: z.boolean().default(false),
      estimatedDurationInSeconds: z.number().min(1),
      exercises: z.array(
        z.object({
          order: z.number().min(0),
          name: z.string().trim().min(1),
          sets: z.number().min(1),
          reps: z.number().min(1),
          restTimeInSeconds: z.number().min(1),
        }),
      ),
    }),
  ),
});

export const GetWorkoutPlanByIdResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  workoutDays: z.array(
    z.object({
      id: z.string().uuid(),
      weekDay: z.enum(WeekDay),
      name: z.string(),
      isRestDay: z.boolean(),
      coverImageUrl: z.string().optional().nullable(),
      estimatedDurationInSeconds: z.number(),
      exercisesCount: z.number(),
    }),
  ),
});

export const GetWorkoutPlansQuerySchema = z.object({
  active: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export const GetWorkoutPlansResponseSchema = z.array(
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    isActive: z.boolean(),
    workoutDays: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        weekDay: z.enum(WeekDay),
        isRestDay: z.boolean(),
        coverImageUrl: z.string().optional().nullable(),
        estimatedDurationInSeconds: z.number(),
        exercises: z.array(
          z.object({
            id: z.string().uuid(),
            name: z.string(),
            order: z.number(),
            sets: z.number(),
            reps: z.number(),
            restTimeInSeconds: z.number(),
          }),
        ),
      }),
    ),
  }),
);

export const GetWorkoutDayResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isRestDay: z.boolean(),
  coverImageUrl: z.string().optional().nullable(),
  estimatedDurationInSeconds: z.number(),
  weekDay: z.enum(WeekDay),
  exercises: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      order: z.number(),
      workoutDayId: z.string().uuid(),
      sets: z.number(),
      reps: z.number(),
      restTimeInSeconds: z.number(),
    }),
  ),
  sessions: z.array(
    z.object({
      id: z.string().uuid(),
      workoutDayId: z.string().uuid(),
      startedAt: z.string().optional().nullable(),
      completedAt: z.string().optional().nullable(),
    }),
  ),
});

export const WorkoutSessionSchema = z.object({
  id: z.string().uuid(),
  workoutDayId: z.string().uuid(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
});

export const WorkoutSetSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  workoutExerciseId: z.string().uuid(),
  setIndex: z.number().int().min(0),
  weightInGrams: z.number().int().min(0),
  reps: z.number().int().min(0),
  createdAt: z.string(),
});

export const UpsertWorkoutSetSchema = z.object({
  weightInGrams: z.number().int().min(0),
  reps: z.number().int().min(0),
});

export const WorkoutExerciseHistorySchema = z.object({
  exerciseId: z.string().uuid(),
  lastSets: z.array(WorkoutSetSchema),
});

export const HomeDataSchema = z.object({
  activeWorkoutPlanId: z.string().uuid().nullable(),
  todayWorkoutDay: z
    .object({
      workoutPlanId: z.string().uuid(),
      id: z.string().uuid(),
      name: z.string(),
      isRestDay: z.boolean(),
      weekDay: z.enum(WeekDay),
      estimatedDurationInSeconds: z.number(),
      coverImageUrl: z.string().optional().nullable(),
      exercisesCount: z.number(),
    })
    .nullable(),
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.string(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    }),
  ),
});

export const StatsResponseSchema = z.object({
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.string(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    }),
  ),
  completedWorkoutsCount: z.number(),
  completedRestDays: z.number(),
  conclusionRate: z.number(),
  totalTimeInSeconds: z.number(),
  totalVolumeInGrams: z.number(),
});
