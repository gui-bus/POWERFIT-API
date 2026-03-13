import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { RenameWorkoutPlan } from "../src/modules/workout/use-cases/RenameWorkoutPlan.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutPlan: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("RenameWorkoutPlan Use Case", () => {
  it("should update the name of a workout plan", async () => {
    const userId = "u1";
    const planId = "p1";
    const newName = "New Name";

    (prisma.workoutPlan.findUnique as any).mockResolvedValue({ id: planId, userId });
    (prisma.workoutPlan.update as any).mockResolvedValue({ id: planId, name: newName });

    const renameWorkoutPlan = new RenameWorkoutPlan();
    const result = await renameWorkoutPlan.execute({ userId, workoutPlanId: planId, name: newName });

    expect(prisma.workoutPlan.update).toHaveBeenCalledWith({
      where: { id: planId },
      data: { name: newName },
    });
    expect(result.name).toBe(newName);
  });
});
