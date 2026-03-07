import z from "zod";

import { WeekDay } from "../generated/prisma/enums.js";

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const WorkoutPlanSchema = z.object({
  id: z.uuid(),
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
  id: z.uuid(),
  workoutDayId: z.uuid(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
});

export const HomeDataSchema = z.object({
  activeWorkoutPlanId: z.uuid().nullable(),
  todayWorkoutDay: z
    .object({
      workoutPlanId: z.uuid(),
      id: z.uuid(),
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
});

export const UserTrainDataSchema = z.object({
  weightInGrams: z.number().int().min(1),
  heightInCentimeters: z.number().int().min(1),
  age: z.number().int().min(1),
  bodyFatPercentage: z.number().min(0).max(1),
});

export const GetUserTrainDataResponseSchema = z
  .object({
    userId: z.string(),
    userName: z.string(),
    weightInGrams: z.number(),
    heightInCentimeters: z.number(),
    age: z.number(),
    bodyFatPercentage: z.number(),
  })
  .nullable();

export const UserRankingSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  streak: z.number(),
});

export const UserRankingResponseSchema = z.object({
  ranking: z.array(UserRankingSchema),
  currentUserPosition: z.number().nullable(),
});

