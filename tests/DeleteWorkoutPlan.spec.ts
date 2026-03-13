import { describe, expect, it, vi } from "vitest";

import { AppError } from "../src/errors/index.js";
import { prisma } from "../src/lib/db.js";
import { DeleteWorkoutPlan } from "../src/modules/workout/use-cases/DeleteWorkoutPlan.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutPlan: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("DeleteWorkoutPlan Use Case", () => {
  it("should delete a plan if it is not active", async () => {
    const userId = "u1";
    const planId = "p1";
    (prisma.workoutPlan.findUnique as any).mockResolvedValue({ id: planId, userId, isActive: false });

    const deleteWorkoutPlan = new DeleteWorkoutPlan();
    await deleteWorkoutPlan.execute({ userId, workoutPlanId: planId });

    expect(prisma.workoutPlan.delete).toHaveBeenCalledWith({ where: { id: planId } });
  });

  it("should throw error if plan is active", async () => {
    const userId = "u1";
    const planId = "p1";
    (prisma.workoutPlan.findUnique as any).mockResolvedValue({ id: planId, userId, isActive: true });

    const deleteWorkoutPlan = new DeleteWorkoutPlan();
    await expect(deleteWorkoutPlan.execute({ userId, workoutPlanId: planId })).rejects.toThrow(AppError);
  });
});
