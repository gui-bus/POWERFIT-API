import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma, PrismaTransaction } from "./db.js";

export const checkWorkoutPlanOwnership = async ({
  workoutPlanId,
  userId,
  tx,
}: {
  workoutPlanId: string;
  userId: string;
  tx?: PrismaTransaction;
}) => {
  const client = tx || prisma;
  const workoutPlan = await client.workoutPlan.findUnique({
    where: { id: workoutPlanId },
  });

  if (!workoutPlan) {
    throw new NotFoundError("Workout plan not found");
  }

  if (workoutPlan.userId !== userId) {
    throw new ForbiddenError(
      "You do not have permission to access this workout plan",
    );
  }

  return workoutPlan;
};
