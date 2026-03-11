import { describe, expect, it, vi } from "vitest";

import { ForbiddenError, NotFoundError } from "../src/errors/index.js";
import { prisma } from "../src/lib/db.js";
import { GetWorkoutPlanById } from "../src/useCases/GetWorkoutPlanById.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutPlan: {
      findUnique: vi.fn(),
    },
  },
}));

describe("GetWorkoutPlanById Use Case", () => {
  it("should return workout plan if user has permission", async () => {
    const userId = "user-1";
    const workoutPlanId = "plan-1";

    (prisma.workoutPlan.findUnique as any).mockResolvedValue({
      id: workoutPlanId,
      name: "Plano 1",
      userId: userId,
      workoutDays: [
        {
          id: "day-1",
          name: "Treino A",
          weekDay: "MONDAY",
          isRestDay: false,
          _count: { exercises: 5 },
          estimatedDurationInSeconds: 3600,
        },
      ],
    });

    const getPlan = new GetWorkoutPlanById();
    const result = await getPlan.execute({ userId, workoutPlanId });

    expect(result.name).toBe("Plano 1");
    expect(result.workoutDays).toHaveLength(1);
    expect(result.workoutDays[0].exercisesCount).toBe(5);
  });

  it("should throw NotFoundError if plan does not exist", async () => {
    (prisma.workoutPlan.findUnique as any).mockResolvedValue(null);
    const getPlan = new GetWorkoutPlanById();

    await expect(
      getPlan.execute({ userId: "any", workoutPlanId: "none" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("should throw ForbiddenError if user does not own the plan", async () => {
    (prisma.workoutPlan.findUnique as any).mockResolvedValue({
      id: "plan-1",
      userId: "other",
    });
    const getPlan = new GetWorkoutPlanById();

    await expect(
      getPlan.execute({ userId: "me", workoutPlanId: "plan-1" }),
    ).rejects.toThrow(ForbiddenError);
  });
});
