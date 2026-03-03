import { NotFoundError } from "../errors/index.js";
import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

export interface InputDto {
  userId: string;
  name: string;
  workoutDays: {
    name: string;
    coverImageUrl?: string | null;
    weekDay: WeekDay;
    isRestDay: boolean;
    estimatedDurationInSeconds: number;
    exercises: {
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }[];
  }[];
}

export interface OutputDto {
  id: string;
  name: string;
  workoutDays: {
    name: string;
    coverImageUrl?: string | null;
    weekDay: WeekDay;
    isRestDay: boolean;
    estimatedDurationInSeconds: number;
    exercises: {
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }[];
  }[];
}

export class CreateWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    // Transaction
    return prisma.$transaction(async (tx) => {
      const existingWorkoutPlan = await tx.workoutPlan.findFirst({
        where: {
          isActive: true,
          userId: dto.userId,
        },
      });

      if (existingWorkoutPlan) {
        await tx.workoutPlan.update({
          where: {
            id: existingWorkoutPlan.id,
          },
          data: {
            isActive: false,
          },
        });
      }

      const workoutPlan = await tx.workoutPlan.create({
        data: {
          id: crypto.randomUUID(),
          name: dto.name,
          userId: dto.userId,
          isActive: true,
          workoutDays: {
            create: dto.workoutDays.map((workoutDay) => ({
              name: workoutDay.name,
              coverImageUrl: workoutDay.coverImageUrl,
              weekDay: workoutDay.weekDay,
              isRestDay: workoutDay.isRestDay,
              estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
              exercises: {
                create: workoutDay.exercises.map((exercise) => ({
                  order: exercise.order,
                  name: exercise.name,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restTimeInSeconds: exercise.restTimeInSeconds,
                })),
              },
            })),
          },
        },
      });

      const result = await tx.workoutPlan.findUnique({
        where: {
          id: workoutPlan.id,
        },
        select: {
          id: true,
          name: true,
          workoutDays: {
            select: {
              name: true,
              coverImageUrl: true,
              weekDay: true,
              isRestDay: true,
              estimatedDurationInSeconds: true,
              exercises: {
                select: {
                  order: true,
                  name: true,
                  sets: true,
                  reps: true,
                  restTimeInSeconds: true,
                },
              },
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundError("Workout plan not found");
      }

      return result as OutputDto;
    });
  }
}
