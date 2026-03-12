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

export class ActivateWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new AppError("Workout plan not found", "NOT_FOUND", 404);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.workoutPlan.updateMany({
        where: { userId: dto.userId, isActive: true },
        data: { isActive: false },
      });

      const activatedPlan = await tx.workoutPlan.update({
        where: { id: dto.workoutPlanId },
        data: { isActive: true },
      });

      return {
        id: activatedPlan.id,
        name: activatedPlan.name,
      };
    });
  }
}
