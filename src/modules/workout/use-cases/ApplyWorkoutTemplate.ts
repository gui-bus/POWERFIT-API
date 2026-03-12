import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  templateId: string;
}

interface OutputDto {
  id: string;
  name: string;
}

export class ApplyWorkoutTemplate {
  async execute(dto: InputDto): Promise<OutputDto> {
    const template = await prisma.workoutTemplate.findUnique({
      where: { id: dto.templateId },
      include: {
        days: {
          include: { exercises: true },
        },
      },
    });

    if (!template) {
      throw new AppError("Workout template not found", "NOT_FOUND", 404);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.workoutPlan.updateMany({
        where: { userId: dto.userId, isActive: true },
        data: { isActive: false },
      });

      const workoutPlan = await tx.workoutPlan.create({
        data: {
          name: template.name,
          userId: dto.userId,
          isActive: true,
          workoutDays: {
            create: template.days.map((day) => ({
              name: day.name,
              weekDay: day.weekDay,
              isRestDay: day.isRestDay,
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
