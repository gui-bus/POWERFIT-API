import { AppError } from "../../../errors/index.js";
import { WeekDay } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  name: string;
  weekDay: WeekDay;
  isRestDay: boolean;
  estimatedDurationInSeconds: number;
  coverImageUrl?: string | null;
  exercises: Array<{
    name: string;
    order: number;
    sets: number;
    reps: number;
    restTimeInSeconds: number;
  }>;
}

export class UpdateWorkoutDay {
  async execute(dto: InputDto): Promise<void> {
    const workoutDay = await prisma.workoutDay.findFirst({
      where: {
        id: dto.workoutDayId,
        workoutPlanId: dto.workoutPlanId,
        workoutPlan: { userId: dto.userId },
      },
    });

    if (!workoutDay) {
      throw new AppError("Workout day not found", "NOT_FOUND", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.workoutDay.update({
        where: { id: dto.workoutDayId },
        data: {
          name: dto.name,
          weekDay: dto.weekDay,
          isRestDay: dto.isRestDay,
          estimatedDurationInSeconds: dto.estimatedDurationInSeconds,
          coverImageUrl: dto.coverImageUrl,
        },
      });

      await tx.workoutExercise.deleteMany({
        where: { workoutDayId: dto.workoutDayId },
      });

      if (dto.exercises.length > 0) {
        await tx.workoutExercise.createMany({
          data: dto.exercises.map((ex) => ({
            workoutDayId: dto.workoutDayId,
            name: ex.name,
            order: ex.order,
            sets: ex.sets,
            reps: ex.reps,
            restTimeInSeconds: ex.restTimeInSeconds,
          })),
        });
      }
    });
  }
}
