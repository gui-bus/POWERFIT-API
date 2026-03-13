import { describe, expect, it, vi } from "vitest";

import { WeekDay } from "../src/generated/prisma/enums.js";
import { prisma } from "../src/lib/db.js";
import { ApplyWorkoutTemplate } from "../src/modules/workout/use-cases/ApplyWorkoutTemplate.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    workoutTemplate: {
      findUnique: vi.fn(),
    },
    workoutPlan: {
      updateMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("ApplyWorkoutTemplate Use Case", () => {
  it("should create a new plan based on a template", async () => {
    const userId = "u1";
    const templateId = "t1";
    const mockTemplate = {
      id: templateId,
      name: "Template A",
      days: [
        {
          name: "Day 1",
          weekDay: WeekDay.MONDAY,
          isRestDay: false,
          estimatedDurationInSeconds: 3600,
          exercises: [{ name: "Exercise 1", order: 0, sets: 3, reps: 10, restTimeInSeconds: 60 }],
        },
      ],
    };

    (prisma.workoutTemplate.findUnique as any).mockResolvedValue(mockTemplate);
    (prisma.workoutPlan.create as any).mockResolvedValue({ id: "plan-id", name: "Template A" });

    const applyWorkoutTemplate = new ApplyWorkoutTemplate();
    const result = await applyWorkoutTemplate.execute({ userId, templateId });

    expect(prisma.workoutPlan.updateMany).toHaveBeenCalled();
    expect(prisma.workoutPlan.create).toHaveBeenCalled();
    expect(result.id).toBe("plan-id");
  });
});
