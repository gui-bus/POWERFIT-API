import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
}

interface OutputDto {
  id: string;
  name: string;
}

export class CloneWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    const originalPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
      include: {
        workoutDays: {
          include: {
            exercises: true,
          },
        },
      },
    });

    if (!originalPlan || originalPlan.userId !== dto.userId) {
      throw new AppError("Workout plan not found", "NOT_FOUND", 404);
    }

    const clonedPlan = await prisma.workoutPlan.create({
      data: {
        name: `${originalPlan.name} (Copy)`,
        userId: dto.userId,
        isActive: false,
        workoutDays: {
          create: originalPlan.workoutDays.map((day) => ({
            name: day.name,
            weekDay: day.weekDay,
            isRestDay: day.isRestDay,
            coverImageUrl: day.coverImageUrl,
            estimatedDurationInSeconds: day.estimatedDurationInSeconds,
            exercises: {
              create: day.exercises.map((exercise) => ({
                name: exercise.name,
                order: exercise.order,
                sets: exercise.sets,
                reps: exercise.reps,
                restTimeInSeconds: exercise.restTimeInSeconds,
              })),
            },
          })),
        },
      },
    });

    return { id: clonedPlan.id, name: clonedPlan.name };
  }
}
