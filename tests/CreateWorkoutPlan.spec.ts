import { describe, expect, it, vi } from "vitest";

import { WeekDay } from "../src/generated/prisma/enums.js";
import { prisma } from "../src/lib/db.js";
import { CreateWorkoutPlan } from "../src/useCases/CreateWorkoutPlan.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    workoutPlan: {
      updateMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("CreateWorkoutPlan Use Case", () => {
  it("should deactivate old plans and create a new active one", async () => {
    const userId = "user-123";
    const dto = {
      userId,
      name: "Bulking Season",
      workoutDays: [
        {
          name: "Push Day",
          weekDay: WeekDay.MONDAY,
          isRestDay: false,
          estimatedDurationInSeconds: 3600,
          exercises: [
            {
              order: 0,
              name: "Bench Press",
              sets: 4,
              reps: 10,
              restTimeInSeconds: 90,
            },
          ],
        },
      ],
    };

    const mockCreatedPlan = {
      id: "new-plan-id",
      name: dto.name,
    };

    (prisma.workoutPlan.updateMany as any).mockResolvedValue({ count: 1 });
    (prisma.workoutPlan.create as any).mockResolvedValue(mockCreatedPlan);

    const createWorkoutPlan = new CreateWorkoutPlan();
    const result = await createWorkoutPlan.execute(dto);

    expect(prisma.workoutPlan.updateMany).toHaveBeenCalledWith({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    expect(prisma.workoutPlan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: dto.name,
        userId,
        isActive: true,
      }),
    });

    expect(result).toEqual({
      id: "new-plan-id",
      name: dto.name,
    });
  });
});
