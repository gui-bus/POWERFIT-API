import { describe, expect, it, vi } from "vitest";

import { AppError } from "../src/errors/index.js";
import { prisma } from "../src/lib/db.js";
import { ActivateWorkoutPlan } from "../src/modules/workout/use-cases/ActivateWorkoutPlan.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    workoutPlan: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("ActivateWorkoutPlan Use Case", () => {
  it("should deactivate old plans and activate the new one", async () => {
    const userId = "u1";
    const planId = "p1";
    const mockPlan = { id: planId, userId, name: "Plan A" };

    (prisma.workoutPlan.findUnique as any).mockResolvedValue(mockPlan);
    (prisma.workoutPlan.update as any).mockResolvedValue(mockPlan);

    const activateWorkoutPlan = new ActivateWorkoutPlan();
    const result = await activateWorkoutPlan.execute({ userId, workoutPlanId: planId });

    expect(prisma.workoutPlan.updateMany).toHaveBeenCalledWith({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
    expect(prisma.workoutPlan.update).toHaveBeenCalledWith({
      where: { id: planId },
      data: { isActive: true },
    });
    expect(result.id).toBe(planId);
  });

  it("should throw error if plan not found or not owned by user", async () => {
    (prisma.workoutPlan.findUnique as any).mockResolvedValue(null);

    const activateWorkoutPlan = new ActivateWorkoutPlan();
    await expect(activateWorkoutPlan.execute({ userId: "u1", workoutPlanId: "invalid" })).rejects.toThrow(AppError);
  });
});
