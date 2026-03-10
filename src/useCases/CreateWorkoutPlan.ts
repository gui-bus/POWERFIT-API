import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

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
}

export class CreateWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    return prisma.$transaction(async (tx) => {
      // 1. Marcar planos antigos como inativos
      await tx.workoutPlan.updateMany({
        where: { userId: dto.userId, isActive: true },
        data: { isActive: false },
      });

      // 2. Criar novo plano ativo
      const workoutPlan = await tx.workoutPlan.create({
        data: {
          name: dto.name,
          userId: dto.userId,
          isActive: true,
          workoutDays: {
            create: dto.workoutDays.map((day) => ({
              name: day.name,
              weekDay: day.weekDay,
              isRestDay: day.isRestDay,
              coverImageUrl: day.coverImageUrl,
              estimatedDurationInSeconds: day.estimatedDurationInSeconds,
              exercises: {
                create: day.exercises.map((ex) => ({
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
      });

      return {
        id: workoutPlan.id,
        name: workoutPlan.name,
      };
    });
  }
}
