import { WeekDay } from "../../../generated/prisma/enums.js";
import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRestDay: boolean;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string | null;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

interface OutputDto {
  id: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRestDay: boolean;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string | null;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

export class CreateWorkoutPlan {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    return this.prisma.$transaction(async (tx: any) => {
      await tx.workoutPlan.updateMany({
        where: { userId: dto.userId, isActive: true },
        data: { isActive: false },
      });

      const workoutPlan = await tx.workoutPlan.create({
        data: {
          name: dto.name,
          userId: dto.userId,
          isActive: true,
          workoutDays: {
            create: dto.workoutDays.map((day: any) => ({
              name: day.name,
              weekDay: day.weekDay,
              isRestDay: day.isRestDay,
              coverImageUrl: day.coverImageUrl,
              estimatedDurationInSeconds: day.estimatedDurationInSeconds,
              exercises: {
                create: day.exercises.map((ex: any) => ({
                  name: ex.name,
                  order: ex.order,
                  sets: ex.sets,
                  reps: ex.reps,
                  restTimeInSeconds: ex.restTimeInSeconds,
                })),
              },
            })),
          },
        },
        include: {
          workoutDays: {
            include: {
              exercises: true,
            },
          },
        },
      });

      return {
        id: workoutPlan.id,
        name: workoutPlan.name,
        workoutDays: workoutPlan.workoutDays.map((day: any) => ({
          name: day.name,
          weekDay: day.weekDay,
          isRestDay: day.isRestDay,
          coverImageUrl: day.coverImageUrl,
          estimatedDurationInSeconds: day.estimatedDurationInSeconds,
          exercises: day.exercises.map((ex: any) => ({
            name: ex.name,
            order: ex.order,
            sets: ex.sets,
            reps: ex.reps,
            restTimeInSeconds: ex.restTimeInSeconds,
          })),
        })),
      };
    });
  }
}
