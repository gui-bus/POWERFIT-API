import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { CloneWorkoutPlan } from "../src/modules/workout/use-cases/CloneWorkoutPlan.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutPlan: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("CloneWorkoutPlan Use Case", () => {
  it("should create a copy of a workout plan", async () => {
    const userId = "u1";
    const planId = "p1";
    const mockOriginal = {
      id: planId,
      userId,
      name: "Original Plan",
      workoutDays: [
        {
          name: "Day 1",
          weekDay: "MONDAY",
          isRestDay: false,
          estimatedDurationInSeconds: 3600,
          exercises: [{ name: "Ex 1", order: 0, sets: 3, reps: 10, restTimeInSeconds: 60 }],
        },
      ],
    };

    (prisma.workoutPlan.findUnique as any).mockResolvedValue(mockOriginal);
    (prisma.workoutPlan.create as any).mockResolvedValue({ id: "cloned-id", name: "Original Plan (Copy)" });

    const cloneWorkoutPlan = new CloneWorkoutPlan();
    const result = await cloneWorkoutPlan.execute({ userId, workoutPlanId: planId });

    expect(prisma.workoutPlan.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Original Plan (Copy)",
          userId,
          isActive: false,
        }),
      }),
    );
    expect(result.id).toBe("cloned-id");
  });
});
