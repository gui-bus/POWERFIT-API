import { describe, expect, it, vi } from "vitest";

import { ForbiddenError, NotFoundError } from "../src/errors/index.js";
import { prisma } from "../src/lib/db.js";
import { GetWorkoutDay } from "../src/useCases/GetWorkoutDay.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutDay: {
      findUnique: vi.fn(),
    },
  },
}));

describe("GetWorkoutDay Use Case", () => {
  it("should return workout day data if user has permission", async () => {
    const userId = "user-1";
    const workoutPlanId = "plan-1";
    const workoutDayId = "day-1";

    const mockWorkoutDay = {
      id: workoutDayId,
      name: "Peito",
      isRestDay: false,
      workoutPlanId,
      estimatedDurationInSeconds: 3600,
      weekDay: "MONDAY",
      workoutPlan: { userId },
      exercises: [{ id: "ex-1", name: "Supino", order: 1 }],
      sessions: [{ id: "sess-1", startedAt: new Date(), completedAt: null }],
    };

    (prisma.workoutDay.findUnique as any).mockResolvedValue(mockWorkoutDay);

    const getWorkoutDay = new GetWorkoutDay();
    const result = await getWorkoutDay.execute({
      userId,
      workoutPlanId,
      workoutDayId,
    });

    expect(result.name).toBe("Peito");
    expect(result.exercises).toHaveLength(1);
    expect(prisma.workoutDay.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: workoutDayId },
      }),
    );
  });

  it("should throw NotFoundError if workout day does not exist", async () => {
    (prisma.workoutDay.findUnique as any).mockResolvedValue(null);
    const getWorkoutDay = new GetWorkoutDay();

    await expect(
      getWorkoutDay.execute({
        userId: "any",
        workoutPlanId: "any",
        workoutDayId: "none",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("should throw ForbiddenError if workout day belongs to another user", async () => {
    const mockWorkoutDay = {
      id: "day-1",
      workoutPlanId: "plan-1",
      workoutPlan: { userId: "other-user" },
    };

    (prisma.workoutDay.findUnique as any).mockResolvedValue(mockWorkoutDay);
    const getWorkoutDay = new GetWorkoutDay();

    await expect(
      getWorkoutDay.execute({
        userId: "me",
        workoutPlanId: "plan-1",
        workoutDayId: "day-1",
      }),
    ).rejects.toThrow(ForbiddenError);
  });
});
