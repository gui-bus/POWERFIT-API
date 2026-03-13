import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  name: string;
}

interface OutputDto {
  id: string;
  name: string;
}

export class RenameWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new AppError("Workout plan not found", "NOT_FOUND", 404);
    }

    const updatedPlan = await prisma.workoutPlan.update({
      where: { id: dto.workoutPlanId },
      data: { name: dto.name },
    });

    return {
      id: updatedPlan.id,
      name: updatedPlan.name,
    };
  }
}
