import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
}

export class DeleteWorkoutPlan {
  async execute(dto: InputDto): Promise<void> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new AppError("Workout plan not found", "NOT_FOUND", 404);
    }

    if (workoutPlan.isActive) {
      throw new AppError("Cannot delete an active workout plan. Activate another plan first.", "BAD_REQUEST", 400);
    }

    await prisma.workoutPlan.delete({
      where: { id: dto.workoutPlanId },
    });
  }
}
